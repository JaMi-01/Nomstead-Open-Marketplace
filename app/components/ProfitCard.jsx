export default function ProfitCard({ item }) {
  const buys = item.buyOffers || [];
  const sells = item.sellOffers || [];

  if (!buys.length || !sells.length) return null;

  const lowestBuy = buys.sort((a, b) => a.price - b.price)[0];
  const highestSell = sells.sort((a, b) => b.price - a.price)[0];

  const profit = highestSell.price - lowestBuy.price;
  if (profit <= 0) return null;

  return (
    <div className="card" style={{ backgroundColor: "#93c5fd" }}>
      <h3>{item.name}</h3>
      <p>Buy from: {lowestBuy.kingdom} @ {lowestBuy.price} gold Qty: {lowestBuy.qty}</p>
      <p>Sell to: {highestSell.kingdom} @ {highestSell.price} gold Qty: {highestSell.qty}</p>
      <p><strong>Profit per unit:</strong> {profit.toFixed(2)} gold</p>
      <p><strong>Total potential profit:</strong> {(profit * lowestBuy.qty).toFixed(2)} gold</p>
    </div>
  );
}