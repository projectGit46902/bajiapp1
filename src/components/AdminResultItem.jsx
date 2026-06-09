import React, { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatDate } from "../utils/formatDate";
import {
  rebuildHomepageCache,
  rebuildMonthCache,
} from "../utils/dbDataFetch";
import Toast from "./Toast";

const AdminResultItem = ({
  data = [],
  loading,
  onRefresh,
}) => {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

  const calculateSum = (num) => {
    return num
      .toString()
      .split("")
      .reduce((a, b) => a + Number(b), 0) % 10;
  };

  const startEdit = (index, value) => {
    setEditing(index);
    setEditValue(value);
  };

  const saveEdit = async (date, index) => {
    try {
      setSaving(true);

      const docRef = doc(db, "results", date);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return;

      const values = [...snap.data().values];

      values[index] = {
        number: Number(editValue),
        sum: calculateSum(editValue),
      };

      await setDoc(docRef, { values });

      const [year, month] = date.split("-");

      await rebuildHomepageCache();
      await rebuildMonthCache(year, month);

      setEditing(null);

      if (onRefresh) {
        await onRefresh();
      }
      showToast("Baji Updated Successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-3">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <>
      {data.map((day, i) => (
        <div key={i} className="mt-4">
        <Toast
                        message={toast.message}
                        type={toast.type}
                        show={toast.show}
                        onClose={() =>
                            setToast({
                                show: false,
                                message: "",
                                type: "success",
                            })
                        }
                    />
          <div className="h5 bg-info py-2 rounded">
            {formatDate(day.date)}
          </div>

          <div className="row row-cols-8 g-1">

            {Array.from({ length: 8 }).map((_, index) => {
              const item = day?.values?.[index];

              return (
                <div
                  key={index}
                  className="col border border-2 border-dark rounded p-1"
                >
                  {item ? (
                    editing === index ? (
                      <>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center mb-1"
                          value={editValue}
                          onChange={(e) =>
                            setEditValue(e.target.value)
                          }
                        />

                        <button
                          className="btn btn-success btn-sm w-100 mb-1"
                          disabled={saving}
                          onClick={() =>
                            saveEdit(day.date, index)
                          }
                        >
                          Save
                        </button>

                        <button
                          className="btn btn-secondary btn-sm w-100"
                          onClick={() =>
                            setEditing(null)
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="border-bottom">
                          {item.sum}
                        </div>

                        <div>{item.number}</div>

                        <button
                          className="btn btn-warning btn-sm w-100 mt-1"
                          onClick={() =>
                            startEdit(
                              index,
                              item.number
                            )
                          }
                        >
                          Edit
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <div>-</div>
                      <div>-</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};

export default AdminResultItem;