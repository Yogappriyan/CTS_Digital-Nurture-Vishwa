import java.util.ArrayList;
import java.util.Scanner;

public class ArrayListExample {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ArrayList<String> studentNames = new ArrayList<>();

        System.out.print("Enter the number of students: ");
        int n = sc.nextInt();
        sc.nextLine(); // Consume newline

        // Add student names
        for (int i = 1; i <= n; i++) {
            System.out.print("Enter name of student " + i + ": ");
            String name = sc.nextLine();
            studentNames.add(name);
        }

        // Display all names
        System.out.println("\nStudent Names:");

        for (String name : studentNames) {
            System.out.println(name);
        }

        sc.close();
    }
}