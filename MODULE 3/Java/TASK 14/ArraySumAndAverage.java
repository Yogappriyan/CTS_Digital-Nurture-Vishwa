import java.util.Scanner;

public class ArraySumAndAverage {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter the number of elements: ");
        int n = sc.nextInt();

        int[] arr = new int[n];
        int sum = 0;

        // Read array elements
        System.out.println("Enter the elements:");

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
            sum += arr[i];
        }

        // Calculate average
        double average = (double) sum / n;

        System.out.println("Sum = " + sum);
        System.out.println("Average = " + average);

        sc.close();
    }
}