// src/components/InputField.tsx
import React from "react";

type Props = {
  label?: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export default function InputField({ label, name, type = "text", value, onChange, placeholder }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", marginBottom: 6 }}>{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}
