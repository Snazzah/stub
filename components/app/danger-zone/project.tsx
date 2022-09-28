import { useDeleteProjectModal } from './delete-project-modal';

export default function ProjectDangerZone() {
  const { setShowDeleteProjectModal, DeleteProjectModal } = useDeleteProjectModal();

  return (
    <div className="bg-white rounded-lg border border-red-500 py-10">
      <DeleteProjectModal />
      <div className="flex flex-col space-y-3 px-10">
        <h2 className="text-xl font-medium">Danger Zone</h2>
      </div>
      <div className="border-b border-gray-200 my-8" />
      <div className="flex flex-col space-y-3 px-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center space-x-2">
            <p className="text-xl font-semibold flex items-center">Delete Project</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteProjectModal(true)}
              className="font-medium text-sm text-white bg-red-600 hover:bg-white hover:text-red-600 border-red-600 px-5 py-2 border rounded-md active:scale-95 transition-all duration-75"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start gap-2">
          <p className="text-sm text-gray-500">
            This will delete all links and link stats that are associated with this project. This cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}
