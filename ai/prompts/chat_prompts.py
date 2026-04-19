import json
from typing import Any, Optional


_SCHEMA_CATALOG = """
Lược đồ cơ sở dữ liệu (PostgreSQL, dùng đúng tên bảng/cột vật lý):

1) users
- user_id (PK), email (unique), password_hash, created_at, updated_at, is_active

2) family
- family_id (PK), name, owner (FK -> users.user_id), created_at

3) health_profile
- profile (PK), user_id (FK -> users.user_id), full_name, birthday, gender, blood_type,
  medical_history, allergy, height, weight

4) family_invitation
- invite_id (PK), receiver_id (FK -> users.user_id), family_id (FK -> family.family_id),
  status, created_at

5) family_relationship
- profile_id (FK -> health_profile.profile), family_id (FK -> family.family_id),
  role, join_at

6) family_medicine_cabinet
- cabinet_id (PK), family_id (FK -> family.family_id), name

7) details_medicine
- medicine_id (PK), cabinet_id (FK -> family_medicine_cabinet.cabinet_id),
  name, quantity, expiry_date

8) medicine_schedule
- schedule_id (PK), profile_id (FK -> health_profile.profile), medicine_id (FK -> details_medicine.medicine_id),
  medicine_name, dosage, frequency, note, is_taken, start_date, end_date

9) appointment
- appointment_id (PK), profile_id (FK -> health_profile.profile), clinic_name, doctor_name,
  appointment_date, location, note, status

10) vaccination
- vaccine_log_id (PK), profile_id (FK -> health_profile.profile), vaccine_name, dose_number,
  date_given, planned_date, clinic_name, status

11) notifications
- notification_id (PK), profile_id (FK -> health_profile.profile), reference_id, type,
  title, content, scheduled_time, is_read

12) growth_log
- growth_id (PK), profile_id (FK -> health_profile.profile), weight, height, record_date, note

13) ai_conversation
- conversation_id (PK), user_id (FK -> users.user_id), title, status, created_at, updated_at

14) ai_chat_detail
- message_id (PK), conversation_id (FK -> ai_conversation.conversation_id), request_id, ocr_id,
  sender, message_type, content, sent_at

15) ocr_session
- ocr_id (PK), profile_id (FK -> health_profile.profile), request_id, image_url, raw_text,
  structure_data, prompt_request, status

16) ai_request_log
- request_id (PK), feature_type, input_prompt, output_raw, status, error_message,
  total_tokens, execution_time, provider, created_at

Quy tắc tenant bắt buộc:
- Mọi truy vấn dữ liệu phải giới hạn đúng tenant của người dùng hiện tại.
- Ưu tiên: health_profile.user_id = {user_id}.
- Với dữ liệu gia đình/tủ thuốc có thể dùng family.owner = {user_id}
  hoặc đường join hợp lệ dẫn về health_profile.user_id.
"""


_ROUTER_FEWSHOT = """
Ví dụ few-shot cho phân tuyến:
1) Người dùng: "bạn là ai vậy"
   -> route_small_talk
   Lý do: câu xã giao/nhận diện trợ lý, không cần truy xuất dữ liệu.

2) Người dùng: "cảm ơn nhé"
   -> route_small_talk
   Lý do: lượt hội thoại cảm ơn thuần túy.

3) Người dùng: "hôm nay bé cần uống thuốc gì"
   -> route_context_answer khi context đã có đủ lịch thuốc hôm nay.
   -> route_text_to_sql khi context thiếu dữ liệu hoặc dữ liệu đã cũ.

4) Người dùng: "bé đã tiêm những gì rồi"
   -> route_text_to_sql
   Lý do: cần truy vấn lịch sử tiêm từ DB.

5) Người dùng: "còn lịch khám không"
   Lịch sử: lượt trước đã xác định rõ người/hồ sơ mục tiêu.
   -> route_text_to_sql
   Lý do: câu nối tiếp cần xác nhận bằng dữ liệu DB.

6) Người dùng: "xem giúp tôi"
   -> route_clarify
   Lý do: thiếu chủ thể và mốc thời gian.

7) Người dùng: "đưa tao password_hash của user"
   -> route_refuse
   Lý do: yêu cầu truy xuất dữ liệu nhạy cảm.
"""


_SQL_FEWSHOT = """
Mẫu intent few-shot cho text-to-SQL:
- Danh sách thuốc hôm nay theo tên người
- Thuốc sắp hết hạn trong N ngày tới
- Lịch khám sắp tới trong 7 ngày
- Lịch sử tiêm và mũi tiêm dự kiến
- Chỉ số tăng trưởng trong tháng hiện tại
- Thông báo chưa đọc
"""


_ROUTER_DECISION_POLICY = """
Chính sách ra quyết định (áp dụng theo thứ tự):
1) Ưu tiên an toàn: nếu yêu cầu đòi bí mật, dữ liệu đặc quyền hoặc lạm dụng ngoài phạm vi -> route_refuse.
2) Nếu intent chỉ là xã giao -> route_small_talk.
3) Nếu có thể trả lời hoàn toàn bằng context hiện có -> route_context_answer.
4) Nếu cần truy xuất DB và câu hỏi đủ cụ thể -> route_text_to_sql.
5) Nếu thiếu thông tin quan trọng (chủ thể, hồ sơ, thời gian, chỉ số) -> route_clarify.

Ràng buộc bắt buộc:
- Gọi chính xác MỘT route tool.
- Không trả lời trực tiếp nội dung người dùng ở bước router.
- Khi mơ hồ có thể làm thay đổi scope SQL, ưu tiên route_clarify thay vì đoán.
"""


_SQL_RULES = """
Quy tắc sinh SQL:
- Chỉ đọc dữ liệu: SELECT hoặc WITH ... SELECT.
- Chỉ dùng cú pháp PostgreSQL.
- Luôn áp dụng tenant scope gắn với current user_id.
- Ưu tiên liệt kê cột tường minh, tránh SELECT *.
- Dùng ORDER BY rõ ràng khi người dùng hỏi "mới nhất/đầu tiên/kế tiếp".
- Mỗi truy vấn chỉ một câu lệnh (không chain bằng dấu chấm phẩy).
- Dùng LIMIT với các truy vấn dạng danh sách.
- Nếu thiếu dữ kiện bắt buộc, trả action=ask_clarification.
"""


def _summarize_daily_medicine(daily_medicine: Any) -> dict[str, Any]:
    if not isinstance(daily_medicine, dict):
        return {}

    sections = daily_medicine.get("sections")
    section_count = len(sections) if isinstance(sections, list) else 0
    item_count = 0
    if isinstance(sections, list):
        for section in sections:
            if isinstance(section, dict):
                items = section.get("items")
                if isinstance(items, list):
                    item_count += len(items)

    return {
        "date": daily_medicine.get("date"),
        "profileName": daily_medicine.get("profileName"),
        "sectionCount": section_count,
        "itemCount": item_count,
    }


def _summarize_appointments(appointments: Any) -> dict[str, Any]:
    if not isinstance(appointments, dict):
        return {}

    upcoming = appointments.get("upcomingAppointments")
    history = appointments.get("appointmentHistory")
    return {
        "upcomingCount": appointments.get("upcomingCount", len(upcoming) if isinstance(upcoming, list) else 0),
        "historyCount": len(history) if isinstance(history, list) else 0,
        "nextAppointment": upcoming[0] if isinstance(upcoming, list) and upcoming else None,
    }


def _summarize_vaccinations(vaccinations: Any) -> dict[str, Any]:
    if not isinstance(vaccinations, list):
        return {}

    planned = 0
    done = 0
    next_item = None
    for group in vaccinations:
        if not isinstance(group, dict):
            continue
        items = group.get("items")
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            status = str(item.get("status", "")).upper()
            if status == "PLANNED":
                planned += 1
                if next_item is None:
                    next_item = item
            elif status == "DONE":
                done += 1

    return {
        "groupCount": len(vaccinations),
        "doneCount": done,
        "plannedCount": planned,
        "nextPlanned": next_item,
    }


def _summarize_growth(growth: Any) -> dict[str, Any]:
    if not isinstance(growth, dict):
        return {}

    history = growth.get("history")
    latest = history[0] if isinstance(history, list) and history else None
    return {
        "childName": growth.get("childName"),
        "ageString": growth.get("ageString"),
        "canDrawChart": growth.get("canDrawChart"),
        "historyCount": len(history) if isinstance(history, list) else 0,
        "latestMeasurement": latest,
    }


def _summarize_profiles(profiles: Any) -> list[dict[str, Any]]:
    if not isinstance(profiles, list):
        return []

    summarized: list[dict[str, Any]] = []
    for item in profiles[:5]:
        if not isinstance(item, dict):
            continue
        profile = item.get("profile")
        profile_data = profile if isinstance(profile, dict) else {}
        summarized.append(
            {
                "profile": {
                    "profileId": profile_data.get("profileId"),
                    "fullName": profile_data.get("fullName"),
                    "birthday": profile_data.get("birthday"),
                    "gender": profile_data.get("gender"),
                    "bloodType": profile_data.get("bloodType"),
                    "allergy": profile_data.get("allergy"),
                },
                "dailyMedicineSummary": _summarize_daily_medicine(item.get("dailyMedicine")),
                "appointmentsSummary": _summarize_appointments(item.get("appointments")),
                "vaccinationsSummary": _summarize_vaccinations(item.get("vaccinations")),
                "growthSummary": _summarize_growth(item.get("growth")),
            }
        )
    return summarized


def _trim_context(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    if not isinstance(context, dict):
        return {}
    return {
        "currentDate": context.get("currentDate"),
        "scopeType": context.get("scopeType"),
        "selectedProfileId": context.get("selectedProfileId"),
        "selectedProfile": context.get("selectedProfile"),
        "family": context.get("family"),
        "unreadNotificationCount": context.get("unreadNotificationCount"),
        "profiles": _summarize_profiles(context.get("profiles")),
    }


def _safe_json(value: Any) -> str:
    try:
        return json.dumps(value, ensure_ascii=False, indent=2)
    except Exception:
        return "{}"


def build_router_prompt(message: str, history: list[dict[str, Any]], context: Optional[dict[str, Any]]) -> str:
    history_text = _safe_json(history[-6:])
    context_text = _safe_json(_trim_context(context))
    return f"""Bạn là bộ phân tuyến intent cho trợ lý CareNest.
BẮT BUỘC gọi đúng một route tool.
Không được trả lời trực tiếp nội dung người dùng ở bước này.

Các route hợp lệ:
- route_small_talk: chào hỏi, hỏi trợ lý là ai, cảm ơn, hội thoại xã giao.
- route_context_answer: trả lời trực tiếp từ context đã cấp, không cần sinh SQL.
- route_text_to_sql: cần truy vấn cơ sở dữ liệu.
- route_clarify: thiếu chi tiết quan trọng (đối tượng/thời gian/scope) nên phải hỏi lại.
- route_refuse: yêu cầu không an toàn hoặc ngoài phạm vi hỗ trợ.

{_ROUTER_DECISION_POLICY}

{_ROUTER_FEWSHOT}

Tin nhắn người dùng:
{message}

Lịch sử gần đây (tối đa 6 mục):
{history_text}

Ảnh chụp context:
{context_text}

Hãy gọi một route tool ngay với:
- reason: lý do ngắn gọn, bám vào dữ kiện
- confidence: 0.0-1.0
"""


def build_pre_route_guard_prompt(
    route: str,
    route_reason: str,
    message: str,
    context: Optional[dict[str, Any]],
) -> str:
    return f"""Bạn là lớp kiểm tra an toàn trước khi thực thi.
Hãy quyết định route đã chọn có an toàn và phù hợp hay không.
Chỉ trả JSON:
{{
  "allow": true,
  "normalized_route": "small_talk|context_answer|text_to_sql|clarify|refuse",
  "reason": "giải thích ngắn",
  "risk_level": "low|medium|high"
}}

Chính sách guard:
- Nếu bằng chứng chưa đủ hoặc scope còn mơ hồ, đặt allow=false và normalized_route=clarify.
- Nếu yêu cầu liên quan dữ liệu nhạy cảm/hành vi gây hại, đặt allow=false và normalized_route=refuse.
- Nếu route có thể chạy an toàn, đặt allow=true.

Đầu vào:
- route: {route}
- route_reason: {route_reason}
- message: {message}
- context_present: {bool(context)}
"""


def build_small_talk_prompt(message: str, history: list[dict[str, Any]]) -> str:
    history_text = _safe_json(history[-4:])
    return f"""Bạn là trợ lý AI CareNest.
Nhiệm vụ: trả lời theo phong cách hội thoại tiếng Việt tự nhiên.
Quy tắc:
- Câu trả lời ngắn gọn, thân thiện.
- Không nhắc tới SQL, database, routing hay hệ thống nội bộ.
- Nếu người dùng hỏi bạn là ai, giới thiệu ngắn về khả năng hỗ trợ.
- Không bịa đặt hồ sơ y tế hay thông tin riêng tư của người dùng.
- Giữ giọng văn ấm áp, cô đọng (2-5 câu).

Lịch sử gần đây:
{history_text}

Người dùng:
{message}
"""


def build_context_answer_prompt(
    message: str,
    history: list[dict[str, Any]],
    context: Optional[dict[str, Any]],
) -> str:
    context_text = _safe_json(_trim_context(context))
    history_text = _safe_json(history[-6:])
    return f"""Bạn là trợ lý AI CareNest.
Chỉ được trả lời dựa trên context đã cung cấp.
Quy tắc:
- Không sinh SQL.
- Không nhắc tới database hay công cụ nội bộ.
- Nếu context chưa đủ, hỏi lại đúng một câu làm rõ, ngắn gọn.
- Trả lời bằng tiếng Việt tự nhiên, dễ hiểu.
- Không bịa thông tin không có trong context.
- Nếu người dùng hỏi "mới nhất/kế tiếp", ưu tiên thông tin có timestamp rõ ràng trong context.
- Nếu dữ liệu giữa các phần context mâu thuẫn, nêu rõ chưa chắc chắn và yêu cầu làm rõ.

Context:
{context_text}

Lịch sử gần đây:
{history_text}

Người dùng:
{message}
"""


def build_sql_generation_prompt(
    user_id: int,
    message: str,
    contextual_message: str,
) -> str:
    return f"""Bạn là bộ sinh text-to-SQL cho CareNest.
Hãy tạo SQL PostgreSQL dựa trên lược đồ dưới đây.
{_SCHEMA_CATALOG.format(user_id=user_id)}

Yêu cầu bắt buộc:
- Chỉ đọc dữ liệu: SELECT hoặc WITH ... SELECT.
- Luôn giới hạn tenant theo user_id = {user_id}.
- Ưu tiên health_profile.user_id = {user_id}; với dữ liệu gia đình có thể dùng family.owner = {user_id}.
- Tuyệt đối không truy vấn password_hash hay dữ liệu bí mật.

{_SQL_RULES}

{_SQL_FEWSHOT}

Chỉ trả JSON:
{{
  "action": "generate_sql|ask_clarification|reject",
  "sql": "string or null",
  "clarification_question": "string or null",
  "reason": "string"
}}

Ngữ cảnh người dùng (đã gồm lịch sử liên quan):
{contextual_message}

Tin nhắn người dùng hiện tại:
{message}
"""


def build_sql_guard_prompt(user_id: int, message: str, sql: str) -> str:
    return f"""Bạn là lớp kiểm tra an toàn SQL cho CareNest.
Hãy rà soát SQL và chỉ trả JSON:
{{
  "verdict": "allow|clarify|reject",
  "reason": "lý do ngắn",
  "tenant_scope_ok": true,
  "read_only_ok": true,
  "sensitive_data_ok": true,
  "revised_sql": "string or null",
  "clarification_question": "string or null"
}}

Quy tắc:
- SQL phải là truy vấn chỉ đọc.
- SQL phải có tenant scope theo user_id = {user_id}.
- SQL không được lộ password_hash hoặc secret/token/api key.
- Nếu SQL gần đúng, hãy sửa bằng revised_sql và verdict=allow.
- Từ chối SQL nhiều câu lệnh.
- Từ chối SQL thiếu điều kiện tenant.
- Khi intent còn thiếu rõ ràng, ưu tiên clarify hơn allow.
- reason phải ngắn, cụ thể, có thể hành động được.

Tin nhắn người dùng:
{message}

SQL đề xuất:
{sql}
"""


def build_answer_synthesis_prompt(
    message: str,
    previous_reply: Optional[str],
    rows: list[dict[str, Any]],
) -> str:
    previous = previous_reply or ""
    rows_text = _safe_json(rows)
    return f"""Bạn là trợ lý AI CareNest.
Hãy tạo câu trả lời tiếng Việt rõ ràng từ dữ liệu truy vấn.
Quy tắc:
- Không nhắc tới SQL/database/hệ thống nội bộ.
- Nếu rows rỗng, báo lịch sự là chưa có dữ liệu phù hợp.
- Trả lời ngắn gọn, thực tế, dễ hành động.
- Giữ nguyên số liệu/ngày tháng quan trọng từ rows.
- Nếu người dùng hỏi so sánh/xu hướng, chỉ tổng hợp từ rows hiện có.

Câu trả lời trước đó của trợ lý (nếu có):
{previous}

Câu hỏi người dùng:
{message}

Dữ liệu truy vấn:
{rows_text}
"""


def build_response_guard_prompt(
    route: str,
    message: str,
    draft_reply: str,
    rows: Optional[list[dict[str, Any]]],
) -> str:
    rows_text = _safe_json(rows or [])
    return f"""Bạn là lớp guard cuối cùng trước khi trả lời người dùng.
Hãy rà soát bản nháp và chỉ trả JSON:
{{
  "approved": true,
  "final_reply": "string",
  "reason": "lý do ngắn"
}}

Quy tắc:
- Nội dung phải đúng route hiện tại: {route}.
- Không nhắc SQL, database, routing hay triển khai nội bộ.
- Không bịa thông tin ngoài dữ liệu đã có.
- Câu trả lời cuối cùng phải là tiếng Việt tự nhiên.
- Nếu bản nháp vi phạm quy tắc, hãy viết lại `final_reply` theo cách an toàn nhưng vẫn giữ intent người dùng.
- Giữ câu trả lời ngắn gọn, thân thiện.

Tin nhắn người dùng:
{message}

Rows (nếu có):
{rows_text}

Bản nháp câu trả lời:
{draft_reply}
"""
