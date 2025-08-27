import ProtectedRoute from '../components/ProtectedRoute';
import NotesApp from '../components/NotesApp';
import LofiCircle from '../components/LofiCircle';

export default function AppPage() {
  return (
    <ProtectedRoute>
      <LofiCircle />
      <NotesApp />
    </ProtectedRoute>
  );
}
