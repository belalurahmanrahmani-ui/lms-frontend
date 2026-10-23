"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserCheck, UserCog, UserX } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { RoleForm } from "@/components/user/RoleForm";
import { UserForm } from "@/components/user/UserForm";
import { callBackend } from "@/lib/api/browser";
import type { AdminUser } from "@/types/user";

const iconButton =
  "rounded-md p-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";

export function UserRowActions({
  user,
  isSelf,
}: {
  user: AdminUser;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive() {
    setError(null);
    setIsLoading(true);

    const action = user.isActive ? "deactive" : "active";
    const result = await callBackend(`Admin/users/${user.id}/${action}`, "PATCH");

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        ` are you soure to delete this  «${user.fullName}» User`
      )
    ) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Admin/users/${user.id}`, "DELETE");

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsChangingRole(true)}
          disabled={isLoading || isSelf}
          title={isSelf ? "You can not change your role" : "Change role"}
          className={`${iconButton} text-highlight`}
        >
          <UserCog className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleActive}
          disabled={isLoading || isSelf}
          title={
            isSelf
              ? "You can not Deactivate your owen acount"
              : user.isActive
                ? "Deactivate"
                : "Activate"
          }
          className={`${iconButton} ${
            user.isActive ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {user.isActive ? (
            <UserX className="h-4 w-4" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
          title="Edit"
          className={`${iconButton} text-sky-400`}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading || isSelf}
          title={isSelf ? "You can not delete your owen acount " : "Delete"}
          className={`${iconButton} text-rose-400`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="max-w-56 text-right text-xs text-destructive">{error}</p>
      )}

      {isEditing && (
        <Modal title="Edit User" onClose={() => setIsEditing(false)}>
          <UserForm user={user} onDone={() => setIsEditing(false)} />
        </Modal>
      )}

      {isChangingRole && (
        <Modal title="Change Role" onClose={() => setIsChangingRole(false)}>
          <RoleForm user={user} onDone={() => setIsChangingRole(false)} />
        </Modal>
      )}
    </div>
  );
}