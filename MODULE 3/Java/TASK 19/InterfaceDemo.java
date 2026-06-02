interface Playable {

    void play();
}

class Guitar implements Playable {

    @Override
    public void play() {
        System.out.println("Playing Guitar");
    }
}

class Piano implements Playable {

    @Override
    public void play() {
        System.out.println("Playing Piano");
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {

        Guitar guitar = new Guitar();
        Piano piano = new Piano();

        guitar.play();
        piano.play();
    }
}