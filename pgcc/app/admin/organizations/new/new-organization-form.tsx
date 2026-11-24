"use client";

import { useActionState } from "react";
import { createOrganization } from "../actions";

type CreateOrganizationState =
  | { error: Record<string, string[] | undefined> }
  | { ok: true; regNo: string; loginPhone: string; tempPassword: string }
  | null;

const initialState: CreateOrganizationState = null;

function Field({
  name,
  label,
  required = true,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span>{label}</span>
      <input name={name} type={type} required={required} className="w-full rounded border px-3 py-2" />
    </label>
  );
}

export default function NewOrganizationForm() {
  const [state, formAction, pending] = useActionState(
    createOrganization,
    initialState,
  );

  if (state && "ok" in state) {
    return (
      <section className="space-y-3 rounded border border-green-700 p-4" role="status">
        <h2 className="font-semibold">Organisation created</h2>
        <p>Registration number: {state.regNo}</p>
        <p>Login phone: {state.loginPhone}</p>
        <p>Temporary password: <code>{state.tempPassword}</code></p>
        <p>Save these login details now. The temporary password will not be shown again.</p>
      </section>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Organisation name" />
        <label className="block space-y-1">
          <span>Level</span>
          <select name="level" required className="w-full rounded border px-3 py-2">
            <option value="NATIONAL">National</option>
            <option value="STATE">State</option>
            <option value="LGA">LGA</option>
            <option value="WARD">Ward</option>
          </select>
        </label>
        <Field name="dateEstablished" label="Date established" required={false} type="date" />
        <Field name="address" label="Address" />
        <Field name="lga" label="LGA" />
        <label className="block space-y-1">
          <span>State</span>
          <input name="state" defaultValue="Kano" required className="w-full rounded border px-3 py-2" />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Officers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="chairmanName" label="Chairman name" />
          <Field name="chairmanPhone" label="Chairman phone" type="tel" />
          <Field name="secretaryName" label="Secretary name" />
          <Field name="secretaryPhone" label="Secretary phone" type="tel" />
          <Field name="proName" label="PRO name" />
          <Field name="proPhone" label="PRO phone" type="tel" />
          <Field name="womenLeaderName" label="Women leader name" />
          <Field name="womenLeaderPhone" label="Women leader phone" type="tel" />
        </div>
      </section>

      {state && "error" in state && (
        <div className="space-y-1 text-sm text-red-700" role="alert">
          {Object.entries(state.error).flatMap(([field, messages]) =>
            messages?.map((message, index) => (
              <p key={`${field}-${index}`}>{field}: {message}</p>
            )),
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create organisation"}
      </button>
    </form>
  );
}
