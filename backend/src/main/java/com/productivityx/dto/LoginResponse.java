package com.productivityx.dto;

import com.productivityx.model.User;

public record LoginResponse(String token, User user) {}
