package com.carenest.backend.dto.family;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinFamilyByCodeRequest {
    @NotBlank(message = "Ma tham gia khong duoc de trong")
    private String joinCode;
}
