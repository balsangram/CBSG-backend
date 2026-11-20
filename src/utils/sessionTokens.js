const TOKEN_LIMIT = 3;

const keepLatestTokens = (field, value) => ({
  $let: {
    vars: {
      tokens: { $ifNull: [`$${field}`, []] },
    },
    in: {
      $cond: [
        { $in: [value, "$$tokens"] },
        "$$tokens",
        {
          $slice: [{ $concatArrays: ["$$tokens", [value]] }, -TOKEN_LIMIT],
        },
      ],
    },
  },
});

const sessionTokenUpdate = (refreshToken, fcmToken) => {
  const $set = {
    refreshToken: keepLatestTokens("refreshToken", refreshToken),
  };

  if (fcmToken) {
    $set.fcmToken = keepLatestTokens("fcmToken", fcmToken);
  }

  return [{ $set }];
};

export { sessionTokenUpdate };
