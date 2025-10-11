export default function ItemCard({ item, type }) {
  const color = type === "buy" ? "#d1fae5" : "#fef3c7";

  return (
    <div className="card" style={{ backgroundColor: color }}>
      <h3>{item.name}</h3>
      <p>Kingdom: {item.kingdom}</p>
      <p>Unit price: {item.price} gold</p>
      <p>Quantity: {item.qty}</p>
    </div>
  );
}