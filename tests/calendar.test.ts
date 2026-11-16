import { describe, expect, it } from "vitest";
import { urgency, projectConflicts } from "../backend/src/services/calendar";
import type { Task } from "../shared/contracts";

describe("RN04: urgencia por calendario de Argentina", () => {
  const now = new Date("2026-11-16T15:00:00Z");
  it.each([
    ["2026-11-15", "overdue"],
    ["2026-11-16", "immediate"],
    ["2026-11-19", "immediate"],
    ["2026-11-20", "soon"],
    ["2026-11-23", "soon"],
    ["2026-11-24", "none"],
  ] as const)("%s produce %s", (date, expected) => {
    expect(urgency(date, "pending", now)).toBe(expected);
  });
  it("sin fecha y entregadas no generan alertas", () => {
    expect(urgency(null, "pending", now)).toBe("none");
    expect(urgency("2026-11-01", "delivered", now)).toBe("none");
  });
  it("UTC después de medianoche aún puede ser el día anterior en Argentina", () => {
    expect(
      urgency("2026-11-16", "pending", new Date("2026-11-17T01:00:00Z")),
    ).toBe("immediate");
  });
  it("calcula al cruzar mes y año bisiesto", () => {
    expect(
      urgency("2028-03-01", "pending", new Date("2028-02-28T15:00:00Z")),
    ).toBe("immediate");
    expect(
      urgency("2027-01-03", "pending", new Date("2026-12-29T15:00:00Z")),
    ).toBe("soon");
  });
});

describe("RN08: conflictos de entrega", () => {
  function task(
    id: string,
    dueDate: string | null,
    status: Task["status"] = "pending",
  ): Task {
    return {
      id,
      projectId: "proyecto",
      title: "Tarea de ejemplo",
      subject: "Redes",
      description: "",
      status,
      priority: "medium",
      isFavorite: false,
      dueDate,
      createdAt: "2026-11-16T15:00:00Z",
      version: 1,
      dependencyIds: [],
      urgency: "none",
    };
  }
  it("tres fechas 16/17/18 forman una ventana inclusiva de tres días", () => {
    const result = projectConflicts([
      task("a", "2026-11-16"),
      task("b", "2026-11-17"),
      task("c", "2026-11-18"),
    ]);
    expect(result).toEqual([
      {
        startDate: "2026-11-16",
        endDate: "2026-11-18",
        taskIds: ["a", "b", "c"],
      },
    ]);
  });
  it("16/17/19 no acumulan tres en la misma ventana", () => {
    expect(
      projectConflicts([
        task("a", "2026-11-16"),
        task("b", "2026-11-17"),
        task("c", "2026-11-19"),
      ]),
    ).toEqual([]);
  });
  it("excluye entregadas y tareas sin fecha", () => {
    expect(
      projectConflicts([
        task("a", "2026-11-16"),
        task("b", "2026-11-17"),
        task("c", "2026-11-18", "delivered"),
        task("d", null),
      ]),
    ).toEqual([]);
  });
});
