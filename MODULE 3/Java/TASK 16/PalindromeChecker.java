import java.util.Scanner;

public class PalindromeChecker {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter a string: ");
        String input = sc.nextLine();

        // Remove non-alphanumeric characters and convert to lowercase
        String cleaned = input.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

        // Reverse the cleaned string
        String reversed = new StringBuilder(cleaned).reverse().toString();

        // Check palindrome
        if (cleaned.equals(reversed)) {
            System.out.println("The string is a Palindrome.");
        } else {
            System.out.println("The string is Not a Palindrome.");
        }

        sc.close();
    }
}