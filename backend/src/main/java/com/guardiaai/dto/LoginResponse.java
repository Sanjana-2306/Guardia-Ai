package com.guardiaai.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {

    private String     token;
    private String     email;
    private String     role;
    private BreachInfo breachInfo;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BreachInfo {
        private boolean breached;
        private int     breachCount;
        private String  status;     // "SAFE" | "BREACHED" | "UNAVAILABLE"

        /** Password not found in any breach database. */
        public static BreachInfo safe() {
            return BreachInfo.builder()
                    .breached(false).breachCount(0).status("SAFE").build();
        }

        /** Password found in breach database {@code count} times. */
        public static BreachInfo breached(int count) {
            return BreachInfo.builder()
                    .breached(true).breachCount(count).status("BREACHED").build();
        }

        /** HIBP API unreachable — result indeterminate. */
        public static BreachInfo unavailable() {
            return BreachInfo.builder()
                    .breached(false).breachCount(0).status("UNAVAILABLE").build();
        }
    }
}
