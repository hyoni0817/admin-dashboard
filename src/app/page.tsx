import { Sidebar } from "@/widgets/sidebar";
import { Header } from "@/widgets/header";

export default function Home() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <Header />
      </main>
    </div>
  );
}
