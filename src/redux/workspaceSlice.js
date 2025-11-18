import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API URL du backend
const API = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------
// THUNK : Charger un workspace complet depuis le backend
// ------------------------------------------------------------
export const loadWorkspace = createAsyncThunk(
  "workspace/loadWorkspace",
  async (workspaceId) => {
    const res = await fetch(`${API}/workspaces/${workspaceId}`);
    const data = await res.json();
    return data;
  }
);

// ------------------------------------------------------------
// SLICE
// ------------------------------------------------------------
const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    currentWorkspace: null,
    loading: false,
    error: null
  },
  reducers: {
    clearWorkspace: (state) => {
      state.currentWorkspace = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
      })
      .addCase(loadWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = "Impossible de charger le workspace";
      });
  }
});

export const { clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
