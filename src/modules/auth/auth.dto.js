const toUserDto = (account, role) => {
    const dto = {
        id: account._id,
        name: account.name,
        email: account.email || null,
        role,
        photo: account.photo || null,
    };

    if (account.phone) dto.phone = account.phone;
    if (account.branchId) dto.branchId = account.branchId;

    return dto;
};

const toOtpDto = (otpDoc, account) => {
    const dto = {
        id: otpDoc._id,
    };

    if (otpDoc.accountModel === "Admin") {
        dto.email = account.email;
        return dto;
    }

    if (otpDoc.accountModel === "Agent") {
        dto.phone = account.phone;
        dto.role = account.role;
        dto.expiresAt = otpDoc.expiresAt;
        return dto;
    }

    dto.phone = account.phone;
    return dto;
};

const toSessionDto = (accessToken, refreshToken, account, role) => ({
    user: toUserDto(account, role),
    accessToken,
    refreshToken,
});

export { toUserDto, toOtpDto, toSessionDto };
