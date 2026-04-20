import io
import logging
import time
from typing import Optional

import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from utils.trace import emit_trace, preview_text

logger = logging.getLogger(__name__)

_WAV_MAGIC = (b'RIFF', b'FORM', b'fLaC')

_CONTENT_TYPE_FORMAT = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "mp4",
    "audio/aac": "aac",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/x-m4a": "m4a",
}


def ensure_wav(audio_bytes: bytes, content_type: str = "", trace_id: Optional[str] = None) -> bytes:
    """
    Return WAV bytes. If input is already WAV/AIFF/FLAC, return as-is.
    Otherwise transcode using pydub (requires ffmpeg installed).
    """
    header = audio_bytes[:4]
    emit_trace(
        logger,
        "voice.ensure_wav.start",
        trace_id=trace_id,
        content_type=content_type,
        input_bytes_size=len(audio_bytes),
    )
    if any(header.startswith(magic) for magic in _WAV_MAGIC):
        emit_trace(
            logger,
            "voice.ensure_wav.skip_convert",
            trace_id=trace_id,
            reason="already_wav_or_supported_lossless",
            output_bytes_size=len(audio_bytes),
        )
        return audio_bytes

    fmt = _CONTENT_TYPE_FORMAT.get(content_type.lower().split(";")[0].strip())
    try:
        transcode_start = time.time()
        # If fmt is None (unknown MIME type), omit format and let ffmpeg autodetect
        if fmt:
            segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format=fmt)
        else:
            segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        out = io.BytesIO()
        segment.export(out, format="wav")
        out.seek(0)
        output_bytes = out.read()
        emit_trace(
            logger,
            "voice.ensure_wav.success",
            trace_id=trace_id,
            source_format=fmt or "autodetect",
            output_bytes_size=len(output_bytes),
            elapsed_ms=round((time.time() - transcode_start) * 1000, 2),
        )
        return output_bytes
    except Exception as e:
        emit_trace(
            logger,
            "voice.ensure_wav.error",
            trace_id=trace_id,
            content_type=content_type,
            error=str(e),
        )
        raise RuntimeError(
            f"Không thể chuyển đổi định dạng audio '{content_type}' sang WAV. "
            f"Vui lòng gửi file WAV, AIFF hoặc FLAC. Chi tiết: {e}"
        )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((sr.RequestError, RuntimeError, ConnectionError, OSError)),
    reraise=True,
)
def speech_to_text(audio_bytes: bytes, language: str = "vi-VN", trace_id: Optional[str] = None) -> str:
    """Convert WAV audio bytes to text using Google Speech Recognition."""
    emit_trace(
        logger,
        "voice.stt.start",
        trace_id=trace_id,
        language=language,
        audio_bytes_size=len(audio_bytes),
    )
    recognizer = sr.Recognizer()
    audio_file = io.BytesIO(audio_bytes)
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio, language=language)
        emit_trace(
            logger,
            "voice.stt.success",
            trace_id=trace_id,
            text_preview=preview_text(text),
            text_length=len(text),
        )
        return text
    except sr.UnknownValueError:
        emit_trace(
            logger,
            "voice.stt.empty",
            trace_id=trace_id,
            reason="unknown_value",
        )
        return ""
    except sr.RequestError as e:
        emit_trace(
            logger,
            "voice.stt.error",
            trace_id=trace_id,
            error=str(e),
        )
        raise RuntimeError(f"Lỗi kết nối Google Speech API: {e}")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((RuntimeError, ConnectionError, OSError)),
    reraise=True,
)
def text_to_speech(text: str, lang: str = "vi", trace_id: Optional[str] = None) -> bytes:
    """Convert text to MP3 audio bytes using gTTS."""
    emit_trace(
        logger,
        "voice.tts.start",
        trace_id=trace_id,
        lang=lang,
        text_preview=preview_text(text),
        text_length=len(text),
    )
    start = time.time()
    tts = gTTS(text=text, lang=lang)
    output = io.BytesIO()
    tts.write_to_fp(output)
    output.seek(0)
    audio_bytes = output.read()
    emit_trace(
        logger,
        "voice.tts.success",
        trace_id=trace_id,
        output_bytes_size=len(audio_bytes),
        elapsed_ms=round((time.time() - start) * 1000, 2),
    )
    return audio_bytes
