export default function SearchBar({ setResults }) {
  const handleSearch = async (e) => {
    const q = e.target.value;
    if (!q) return setResults([]);
    const res = await fetch(`https://api.nomstead.com/open/marketplace?q=${q}`);
    const data = await res.json();
    setResults(data);
  };

  return <input placeholder="Search item..." onChange={handleSearch} />;
}