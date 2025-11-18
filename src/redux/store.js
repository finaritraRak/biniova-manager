import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import userReducer from "./userSlice";
import workspaceReducer from "./workspaceSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    workspace: workspaceReducer
  }
});
