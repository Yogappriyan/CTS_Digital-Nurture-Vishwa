public class TypeCastingExample {
    public static void main(String[] args) {

        // Double to Int (Narrowing Casting)
        double doubleValue = 25.75;
        int intValue = (int) doubleValue;

        System.out.println("Original Double Value: " + doubleValue);
        System.out.println("After Casting to Int: " + intValue);

        // Int to Double (Widening Casting)
        int number = 100;
        double convertedDouble = (double) number;

        System.out.println("Original Int Value: " + number);
        System.out.println("After Casting to Double: " + convertedDouble);
    }
}