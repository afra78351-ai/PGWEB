const Header = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>La Tienda Foránea</h1>
      <span style={styles.rate}>USD • Tasa BCV: 390.63 Bs</span>
    </header>
  );
};

const styles = {
  header: { marginBottom: "16px" },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
    color: "#111",
  },
  rate: {
    fontSize: "14px",
    color: "#666",
  },
};

export default Header;
