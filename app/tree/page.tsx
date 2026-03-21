"use client";

import { useState, useEffect, useRef } from "react";
import { TreeVisualization } from "@/app/components/TreeVisualization";

interface DepartmentInfo {
  mnemonic: string;
  fullName: string;
}

export default function TreePage() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInfo | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Fetch departments on mount
  useEffect(() => {
    async function fetchDepartments() {
      const res = await fetch("/api/tree/departments");
      const depts: DepartmentInfo[] = await res.json();
      setDepartments(depts);
    }
    fetchDepartments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isClickInsideInput = searchInputRef.current && searchInputRef.current.contains(e.target as Node);
      const isClickInsideDropdown = dropdownContainerRef.current && dropdownContainerRef.current.contains(e.target as Node);
      
      if (!isClickInsideInput && !isClickInsideDropdown) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter departments based on search text
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.mnemonic.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectDepartment = (dept: DepartmentInfo) => {
    setSelectedDepartment(dept);
    setSearchText("");
    setShowDropdown(false);
  };



  return (
    <div className="w-full pt-0 pb-6">
      <div className="mb-6 border-b border-panel-border pb-4">
        <h1 className="text-3xl font-bold text-heading">Prerequisite Tree</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-panel-bg p-6 rounded-xl border border-panel-border">
            <label className="block text-sm font-semibold text-heading mb-3">Select Department</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search departments..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-3 py-2.5 bg-panel-bg-alt border border-panel-border-strong rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-uva-blue/30"
              />
              
              {showDropdown && filteredDepartments.length > 0 && (
                <div
                  ref={dropdownContainerRef}
                  className="absolute z-50 left-0 top-full w-full mt-1.5 bg-panel-bg border border-panel-border rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredDepartments.map((dept) => (
                      <button
                        key={dept.mnemonic}
                        onClick={() => handleSelectDepartment(dept)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                          selectedDepartment?.mnemonic === dept.mnemonic
                            ? "bg-uva-blue text-white"
                            : "hover:bg-hover-bg text-text-primary"
                        }`}
                      >
                        <div className="font-medium">{dept.fullName}</div>
                        <div className="text-xs opacity-75">{dept.mnemonic}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedDepartment && (
              <div className="mt-6 pt-6 border-t border-panel-border">
                <div className="text-sm font-medium text-heading mb-2">Currently Viewing</div>
                <div className="bg-panel-bg-alt p-3 rounded-lg">
                  <div className="font-semibold text-uva-blue">{selectedDepartment.fullName}</div>
                  <div className="text-xs text-text-secondary">{selectedDepartment.mnemonic}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tree Visualization Panel */}
        <div className="lg:col-span-3">
          <div className="bg-panel-bg rounded-xl border border-panel-border overflow-hidden flex flex-col h-full">
            {selectedDepartment ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 border-b border-panel-border">
                  <h2 className="text-2xl font-bold text-heading">
                    {selectedDepartment.fullName}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {selectedDepartment.mnemonic} course prerequisites
                  </p>
                </div>
                <div className="flex-1 overflow-auto">
                  <TreeVisualization department={selectedDepartment.mnemonic} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-text-secondary">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No Department Selected</p>
                  <p className="text-sm">Select a department from the left panel to view its prerequisite tree</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
