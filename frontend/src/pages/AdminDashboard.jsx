import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import POCTable from "../components/admin/POCTable";
import UserTable from "../components/admin/UserTable";
import POCForm from "../components/admin/POCForm";
import AdminSearch from "../components/admin/AdminSearch";
import { BranchBadge } from "../components/common/Badge";
import { getAllPOCs } from "../services/pocService";
import { BRANCHES } from "../config/constants";
import { useUser } from "@clerk/clerk-react";
import RecentTab from "../components/admin/RecentTab";
import { useCount } from "../context/CountContext";

const TABS = ["Search", "POCs", "Recent Activity", "Users"];

function normalizePOC(poc = {}) {
  return {
    ...poc,
    name: poc.name || poc.companyName || poc.company || "N/A",
    createdAt:
      poc.createdAt ||
      poc.addedAt ||
      poc.dateCreated ||
      poc.updatedAt ||
      new Date().toISOString(),
    branch: poc.branch || "",
    aliases: Array.isArray(poc.aliases) ? poc.aliases : [],
    userId: poc.userId || poc.addedBy || null,
  };
}

export default function AdminDashboard() {
  const { user } = useUser();
  const {
    recentCount,
    setRecentCount,
    usersCount,
    verifiedCount,
    allPOCs,
    setAllPOCs,
  } = useCount();

  const [activeTab, setActiveTab] = useState("Search");

  const [pocs, setPocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [pocCursor, setPocCursor] = useState(0); // 0 acts as our starting offset
  const [userCursor, setUserCursor] = useState(null);
  const [recentCursor, setRecentCursor] = useState(null);

  const [branchFilter, setBranchFilter] = useState("CSE");
  const [recentActivity, setRecentActivity] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPOC, setEditingPOC] = useState(null);

  const loadAllPOCs = useCallback(async () => {
    try {
      const data = await getAllPOCs();
      setAllPOCs((data || []).map(normalizePOC));
    } catch (err) {
      console.error(err);
    }
  }, [setAllPOCs]);

  const handleEdit = (poc) => {
    setEditingPOC(poc);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPOC(null);
  };

  const pendingCount = users.filter((u) => !u.isVerified).length;
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  const onlineCount = users.filter(
    (u) => u.lastVisit && new Date(u.lastVisit) > fiveMinsAgo,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-0">
          <h1 className="text-2xl font-display font-extrabold text-white mb-1">
            Admin Dashboard
          </h1>

          <p className="text-white/40 text-sm font-body mb-6">
            Manage POCs, verify users, and monitor portal activity.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-0">
            {[
              {
                label: "Total POCs",
                value: allPOCs.length,
                icon: "🏢",
                color: "bg-blue-500",
              },
              {
                label: "Total Users",
                value: usersCount,
                icon: "👥",
                color: "bg-purple-500",
              },
              {
                label: "Verified",
                value: verifiedCount,
                icon: "✅",
                color: "bg-emerald-500",
              },
              {
                label: "Online Now",
                value: onlineCount,
                icon: "🟢",
                color: "bg-teal-500",
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-fade-in"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${color}/20 flex items-center justify-center mb-2 text-sm`}
                >
                  {icon}
                </div>

                <p className="text-2xl font-display font-extrabold text-white">
                  {value}
                </p>

                <p className="text-white/40 text-xs font-body">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-2 pb-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-body font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-slate-50 text-navy shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}

                  {tab === "Users" && pendingCount > 0 && (
                    <span className="ml-1.5 bg-amber-400 text-navy text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {activeTab === "Search" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminSearch />

            <div className="card p-6">
              <h3 className="font-display font-bold text-navy mb-4">
                POCs by Branch
              </h3>

              <div className="space-y-3">
                {BRANCHES.map((b) => {
                  const count = allPOCs.filter((p) => p == b).length;
                  const pct = allPOCs.length
                    ? Math.round((count / allPOCs?.length) * 100)
                    : 0;

                  return (
                    <div key={b} className="flex items-center gap-3">
                      <BranchBadge branch={b} />

                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className="text-xs text-slate-500 w-6 text-right font-body">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="card p-6 border-amber-200 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-navy">
                    ⏳ Pending Verifications
                    <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  </h3>

                  <button
                    onClick={() => setActiveTab("Users")}
                    className="text-xs text-navy font-medium hover:underline"
                  >
                    View all users →
                  </button>
                </div>

                <div className="space-y-2">
                  {users
                    .filter((u) => !u.isVerified)
                    .slice(0, 5)
                    .map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100"
                      >
                        <div>
                          <p className="text-sm font-semibold text-navy font-body">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>

                        <span className="text-xs text-amber-600 font-body">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "POCs" && (
          <div className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 items-center pb-2">
                {BRANCHES.map((b) => (
                  <button
                    key={b}
                    onClick={() => {setBranchFilter(b),setPocs([]),setPocCursor(0)}}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all whitespace-nowrap ${
                      branchFilter === b
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-slate-600 border-slate-200 hover:border-navy/30"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-sm py-2 whitespace-nowrap"
              >
                + Add POC
              </button>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-semibold text-navy text-sm">
                  {branchFilter ? `${branchFilter} POCs` : "All POCs"}
                </h3>
              </div>

              <div className="p-4">
                <POCTable
                  pocs={pocs}
                  setPocs={setPocs}
                  pocCursor={pocCursor}
                  setPocCursor={setPocCursor}
                  branch={branchFilter}
                  onEdit={handleEdit}
                  showAddedBy
                  currentUser={user}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Recent Activity" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-navy">
                Recent Activity
              </h3>

              <span className="text-sm text-slate-500">
                {recentCount} History Records
              </span>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="p-4">
                <RecentTab
                  recentItems={recentActivity}
                  setRecentItems={setRecentActivity}
                  nextCursor={recentCursor}
                  setNextCursor={setRecentCursor}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <h3 className="font-display font-semibold text-navy">
                Registered Users — {users.length} total
              </h3>

              <div className="flex gap-2 text-xs text-slate-500">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  {verifiedCount} verified
                </span>

                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {pendingCount} pending
                </span>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="p-4">
                <UserTable
                  users={users}
                  setUsers={setUsers}
                  userCursor={userCursor}
                  setUserCursor={setUserCursor}
                  currentUser={user}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <POCForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editing={editingPOC}
      />
    </div>
  );
}