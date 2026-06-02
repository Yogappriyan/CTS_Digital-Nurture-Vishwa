import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class FileWritingDemo {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter a string: ");
        String text = sc.nextLine();

        try {
            FileWriter writer = new FileWriter("output.txt");

            writer.write(text);

            writer.close();

            System.out.println("Data has been written to output.txt successfully.");

        } catch (IOException e) {
            System.out.println("An error occurred while writing to the file.");
            System.out.println(e.getMessage());
        }

        sc.close();
    }
}