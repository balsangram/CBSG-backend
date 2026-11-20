const toUserDto = (account, role) => ({
    id: account._id,
    name: account.name,
    email: account.email || null,
    phoneNo: account.phoneNo,
    role,
    photo: account.photo || null,
});

const toOtpDto = (otpDoc, account) => {
    const dto = {
        id: otpDoc._id,
    };

    if (otpDoc.accountModel === "Admin") {
        dto.email = account.email;
        return dto;
    }

    dto.phoneNo = account.phoneNo;
    return dto;
};

const toSessionDto = (accessToken, refreshToken, account, role) => ({
    user: toUserDto(account, role),
    accessToken,
    refreshToken,
});

export { toUserDto, toOtpDto, toSessionDto };
