public class exercise34 {
    static class StringUtils {
        public static String greet(String name) {
            return "Hello, " + name + "! Welcome to the Community Portal.";
        }
        public static String toUpperCase(String s) {
            return s.toUpperCase();
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Java Module System Demo ===");
        System.out.println("(See comments above for full module project structure)");
        System.out.println();
        System.out.println(StringUtils.greet("Alice"));
        System.out.println(StringUtils.greet("Bob"));
        System.out.println(StringUtils.toUpperCase("community event portal"));
    }
}
