import java.sql.*;
public class exercise33 {

    static final String URL  = "jdbc:mysql://localhost:3306/community_portal";
    static final String USER = "root";
    static final String PASS = "your_password";

    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(URL, USER, PASS)) {
            conn.createStatement().execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    account_id INT PRIMARY KEY,
                    owner      VARCHAR(100),
                    balance    DECIMAL(10,2)
                )
            """);
            conn.createStatement().execute("DELETE FROM accounts");
            conn.createStatement().execute("INSERT INTO accounts VALUES (1, 'Alice', 1000.00)");
            conn.createStatement().execute("INSERT INTO accounts VALUES (2, 'Bob',   500.00)");
            System.out.println("Initial balances: Alice=1000.00, Bob=500.00");
            transfer(conn, 1, 2, 300.00);
            ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM accounts");
            System.out.println("\nUpdated Balances:");
            while (rs.next()) {
                System.out.printf("  %s: %.2f%n", rs.getString("owner"), rs.getDouble("balance"));
            }

        } catch (SQLException e) {
            System.out.println("❌ DB Error: " + e.getMessage());
        }
    }

    static void transfer(Connection conn, int fromId, int toId, double amount) throws SQLException {
        conn.setAutoCommit(false);  // Begin transaction
        System.out.println("\nTransferring ₹" + amount + " from Account " + fromId + " to Account " + toId);

        try {
            String debit = "UPDATE accounts SET balance = balance - ? WHERE account_id = ? AND balance >= ?";
            try (PreparedStatement ps = conn.prepareStatement(debit)) {
                ps.setDouble(1, amount);
                ps.setInt(2, fromId);
                ps.setDouble(3, amount);
                int rows = ps.executeUpdate();
                if (rows == 0) throw new SQLException("Insufficient balance in account " + fromId);
            }
            String credit = "UPDATE accounts SET balance = balance + ? WHERE account_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(credit)) {
                ps.setDouble(1, amount);
                ps.setInt(2, toId);
                ps.executeUpdate();
            }

            conn.commit();  // Both succeeded — commit
            System.out.println("✅ Transfer successful! Transaction committed.");

        } catch (SQLException e) {
            conn.rollback();  // Either failed — rollback
            System.out.println("❌ Transfer failed. Transaction rolled back: " + e.getMessage());
        } finally {
            conn.setAutoCommit(true);
        }
    }
}
