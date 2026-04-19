package com.carenest.backend.model.enums;

public enum FamilyRole {
    OWNER("Chu gia dinh"),
    MEMBER("Thanh vien"),
    FATHER("Bo"),
    MOTHER("Me"),
    OLDER_BROTHER("Anh"),
    OLDER_SISTER("Chi"),
    YOUNGER("Em"),
    OTHER("Nguoi than");

    private final String displayName;

    FamilyRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
