import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
public class exercise27 {
    public static void main(String[] args) {
         List<String> names = new ArrayList<>();

        names.add("Charlie");
        names.add("Alice");
        names.add("Bob");
        names.add("David");

        Collections.sort(names, (a, b) -> a.compareTo(b));

        System.out.println("Sorted Names:");

        for(String name : names) {
            System.out.println(name);
        }
    }
}
