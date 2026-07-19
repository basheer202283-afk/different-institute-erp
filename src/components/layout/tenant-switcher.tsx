"use client";

import { useTenant } from "@/lib/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Check, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TenantSwitcher() {
  const { organization, branch, branches, organizations, switchOrganization, switchBranch } = useTenant();
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  if (!organization) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Organization Switcher */}
      <div className="relative">
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-9 px-3"
          onClick={() => setShowOrgMenu(!showOrgMenu)}
        >
          <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: organization.brand_color || "#3B82F6" }}>
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium truncate max-w-[120px]">{organization.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        {showOrgMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowOrgMenu(false)} />
            <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg border bg-card shadow-lg">
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Switch Organization</p>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors",
                      org.id === organization.id && "bg-accent"
                    )}
                    onClick={() => {
                      switchOrganization(org.id);
                      setShowOrgMenu(false);
                    }}
                  >
                    <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: org.brand_color || "#3B82F6" }}>
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.city || org.country}</p>
                    </div>
                    {org.id === organization.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Branch Switcher */}
      {branches.length > 0 && (
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-9 px-3"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
          >
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm truncate max-w-[100px]">
              {branch?.name || "Select Branch"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          {showBranchMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBranchMenu(false)} />
              <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-lg border bg-card shadow-lg">
                <div className="p-2">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Switch Branch</p>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      className={cn(
                        "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors",
                        b.id === branch?.id && "bg-accent"
                      )}
                      onClick={() => {
                        switchBranch(b.id);
                        setShowBranchMenu(false);
                      }}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.code}</p>
                      </div>
                      {b.id === branch?.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
