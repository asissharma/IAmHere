import { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error uploading file');
    }
  };

  return (
    <div>
      <h1>Upload a Book</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.docx,.epub" onChange={handleFileChange} />
        <button type="submit">Upload and Convert</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
