import { useEffect, useMemo, useState } from "react";
import { MdOutlineDone, MdModeEditOutline } from "react-icons/md";
import { IoClipboardOutline } from "react-icons/io5";
import { FaTrash, FaMoon, FaSun } from "react-icons/fa";
import axios from "axios";

function App() {

  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") !== "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const fetchTodos = async () => {
    const res = await axios.get("/api/todos");
    setTodos(res.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await axios.post("/api/todos", {
      text: newTodo,
      priority,
      dueDate
    });

    setTodos([...todos, res.data]);
    setNewTodo("");
    setPriority("medium");
    setDueDate("");
  };

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`);
    setTodos(todos.filter((t) => t._id !== id));
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t._id === id);

    const res = await axios.patch(`/api/todos/${id}`, {
      completed: !todo.completed
    });

    setTodos(todos.map((t) => (t._id === id ? res.data : t)));
  };

  // Analytics
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  // Smart filtering
  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) =>
        todo.text.toLowerCase().includes(search.toLowerCase())
      )
      .filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      })
      .sort((a, b) => {
        if (a.priority === "high") return -1;
        if (b.priority === "high") return 1;
        return 0;
      });
  }, [todos, search, filter]);

  const priorityColor = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400"
  };

  const dueStatus = (date) => {
    if (!date) return "";
    const today = new Date().toISOString().split("T")[0];

    if (date < today) return "text-red-500";
    if (date === today) return "text-yellow-400";
    return "text-cyan-400";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4
      ${dark
        ? "bg-gradient-to-br from-black via-slate-900 to-black text-white"
        : "bg-gray-100 text-black"}`}
    >

      <div className="w-full max-w-xl backdrop-blur-xl
      bg-white/5 border border-cyan-400/20
      rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.15)]
      p-8 relative">

        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-5 right-5 text-xl text-cyan-400"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-cyan-400">
          <IoClipboardOutline />
          Task Manager
        </h1>

        {/* Analytics */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-center">
          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-xs opacity-60">Total</p>
            <p className="text-xl font-bold">{todos.length}</p>
          </div>

          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-xs opacity-60">Completed</p>
            <p className="text-xl font-bold text-green-400">
              {completedCount}
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-xs opacity-60">Pending</p>
            <p className="text-xl font-bold text-yellow-400">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-cyan-400 h-2 rounded-full shadow-lg shadow-cyan-400/40"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-3 mb-4 rounded-lg bg-black/40 border border-cyan-400/20"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm
              ${filter === f
                ? "bg-cyan-500 text-black"
                : "bg-black/30 border border-cyan-400/20"}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Add Todo */}
        <form
          onSubmit={addTodo}
          className="flex flex-col sm:flex-row gap-2
          bg-black/30 p-3 rounded-lg mb-6"
        >
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new task..."
            className="flex-1 bg-transparent outline-none px-2"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-black/40 p-2 rounded-lg"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-black/40 p-2 rounded-lg"
          />

          <button className="bg-cyan-500 text-black px-4 rounded-lg">
            ADD
          </button>
        </form>

        {/* Todo list */}
        <div className="flex flex-col gap-3">

          {filteredTodos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-center justify-between p-3 rounded-lg
              bg-black/30 border border-cyan-400/10
              hover:border-cyan-400/40 transition"
            >

              <div className="flex items-center gap-3">

                <button
                  onClick={() => toggleTodo(todo._id)}
                  className={`h-6 w-6 rounded-full border flex items-center justify-center
                  ${todo.completed
                    ? "bg-green-500 border-green-500"
                    : "border-cyan-400"}`}
                >
                  {todo.completed && <MdOutlineDone />}
                </button>

                <div>
                  <p className={`${todo.completed ? "line-through opacity-50" : ""}`}>
                    {todo.text}
                  </p>

                  <div className="text-xs flex gap-3">
                    <span className={priorityColor[todo.priority]}>
                      {todo.priority}
                    </span>

                    {todo.dueDate && (
                      <span className={dueStatus(todo.dueDate)}>
                        Due: {todo.dueDate}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex gap-3">

                <button className="text-cyan-400">
                  <MdModeEditOutline />
                </button>

                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-red-400"
                >
                  <FaTrash />
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default App;