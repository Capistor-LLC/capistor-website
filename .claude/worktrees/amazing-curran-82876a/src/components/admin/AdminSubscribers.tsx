import { useEffect, useState } from "react";
import { supabase, DbSubscriber } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<DbSubscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setSubs([]);
      return;
    }
    setSubs(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the mailing list?`)) return;
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    load();
  };

  const exportCsv = () => {
    if (!subs || subs.length === 0) return;
    const rows = [
      ["email", "source", "confirmed", "created_at"],
      ...subs.map((s) => [
        s.email,
        s.source ?? "",
        String(s.confirmed),
        s.created_at,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capistor-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.2em] mb-2">
            Mailing list
          </p>
          <h1 className="text-3xl font-futura font-bold text-black">
            Subscribers
          </h1>
        </div>
        <button
          onClick={exportCsv}
          disabled={!subs || subs.length === 0}
          className="px-4 py-2 rounded-lg border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue hover:border-sexyblue/40 font-futura text-sm transition-colors disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      {subs === null ? (
        <p className="text-sexyblue/50 font-fransisco">Loading…</p>
      ) : subs.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-capistor-300/50 bg-white">
          <p className="text-sexyblue/55 font-fransisco">
            No subscribers yet. The footer signup form will populate this list.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-capistor-200/70 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-capistor-50/50 border-b border-capistor-200/70">
              <tr>
                <th className="text-left p-3 text-sexyblue/50 font-futura text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left p-3 text-sexyblue/50 font-futura text-xs uppercase tracking-wider">
                  Source
                </th>
                <th className="text-left p-3 text-sexyblue/50 font-futura text-xs uppercase tracking-wider">
                  Joined
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-capistor-100 last:border-b-0">
                  <td className="p-3 text-black font-fransisco text-sm">{s.email}</td>
                  <td className="p-3 text-sexyblue/55 font-fransisco text-sm">
                    {s.source || "—"}
                  </td>
                  <td className="p-3 text-sexyblue/55 font-fransisco text-sm">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDelete(s.id, s.email)}
                      className="text-red-600 hover:bg-red-50 font-futura text-xs px-2 py-1 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
