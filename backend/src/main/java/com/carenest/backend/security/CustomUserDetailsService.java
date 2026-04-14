package com.carenest.backend.security;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.carenest.backend.service.AuthService;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthService authService;

    public CustomUserDetailsService(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.carenest.backend.model.User myUser = authService.findUserByEmail(username);
        
        return new org.springframework.security.core.userdetails.User(
                myUser.getEmail(),
                myUser.getPasswordHash(),
                Collections.emptyList()
        );
    }
}
