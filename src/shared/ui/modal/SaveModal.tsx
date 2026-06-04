export const SaveModal = ({ isOpen, onClose, subjectName, onUpdate, onSaveNew }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
        <h3>Save</h3>
        <button onClick={() => onSaveNew("Тест")}>Сохранить</button>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};