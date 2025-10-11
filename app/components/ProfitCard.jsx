export default function ProfitCard({ item }) {
  const buyer = item.toSell.reduce((a, b) =>
    a.unitPrice > b.unitPrice ? a : b
  );
  const seller = item.toBuy.reduce((a, b) =>
    a.unitPrice < b.unitPrice ? a : b
  );

  const profitPerUnit = buyer.unitPrice - seller.unitPrice;
  const [bulk, setBulk] = React.useState(1);

  return (
    <div style={{
      background: "#1c3b5b",
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    }}>
      <h3>{item.object.name}</h3>
      <p>Buy from: <a href={seller.tile.url}>{seller.tile.name}</a> @ {seller.unitPrice} gold Qty: {seller.availableQuantity}</p>
      <p>Sell to: <a href={buyer.tile.url}>{buyer.tile.name}</a> @ {buyer.unitPrice} gold Qty: {buyer.desiredQuantity}</p>
      <p>Profit per unit: {profitPerUnit.toFixed(3)} gold</p>
      <label>Bulk: </label>
      <input
        type="number"
        min="1"
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        style={{ width: 60 }}
      />
      <p>Total profit: {(profitPerUnit * bulk).toFixed(3)} gold</p>
    </div>
  );
}