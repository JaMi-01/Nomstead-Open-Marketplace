export default function ItemCard({ item, type }) {
  const entries = type === "buy" ? item.toBuy : item.toSell;
  if (!entries?.length) return null;

  return (
    <div style={{
      background: "#222",
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    }}>
      <h3>{item.object.name}</h3>
      {entries.map((e, i) => (
        <div key={i}>
          <a href={e.tile.url} target="_blank">{e.tile.name}</a> — {e.unitPrice} gold — Qty: {e.availableQuantity || e.desiredQuantity}
        </div>
      ))}
    </div>
  );
}