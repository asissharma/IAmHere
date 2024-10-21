import { useState, useEffect } from 'react';

interface Book {
  _id: string;
  title: string;
  content: string;
}

const Books = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch all books when the component loads
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/getBooks');
        const data = await res.json();
        setBooks(data.books);
      } catch (error) {
        setMessage('Error fetching books');
      }
    };
    fetchBooks();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); // Show loading state

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploadBooks', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        // Fetch books again after successful upload
        const res = await fetch('/api/books');
        const booksData = await res.json();
        setBooks(booksData.books);
      }
    } catch (error) {
      setMessage('Error uploading file');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleBookClick = (book: Book) => {
    setActiveBook(book);
  };

  return (
    <div className="books-container">
      {/* Sidebar Toggle */}
      <button className="toggle-sidebar" onClick={() => setSidebarVisible(!sidebarVisible)}>
        {sidebarVisible ? 'Hide Books' : 'Show Books'}
      </button>

      {/* Sidebar for Books List */}
      <aside className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
        <h2>Books List</h2>
        <ul>
          {books.map(book => (
            <li
              key={book._id}
              className={`book-title ${activeBook?._id === book._id ? 'active' : ''}`}
              onClick={() => handleBookClick(book)}
            >
              {book.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        <section className="upload-section">
          <h1>Upload a Book</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".pdf,.docx,.epub"
              onChange={handleFileChange}
              className="file-input"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload and Convert'}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>

        {/* Reader Section */}
        <section className="reader-section">
          {activeBook ? (
            <div className="book-reader">
              <h2>{activeBook.title}</h2>
              <article dangerouslySetInnerHTML={{ __html: activeBook.content }}></article>
            </div>
          ) : (
            <p>Please select a book to read</p>
          )}
        </section>
      </main>

      <style jsx>{`
        .books-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 250px;
          background-color: #f8f9fa;
          padding: 20px;
          overflow-y: auto;
          transition: width 0.3s ease;
        }

        .sidebar.hidden {
          width: 0;
          padding: 0;
          visibility: hidden;
        }

        .book-title {
          cursor: pointer;
          padding: 10px;
          margin-bottom: 5px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .book-title:hover {
          background-color: #e2e6ea;
        }

        .book-title.active {
          background-color: #007bff;
          color: white;
        }

        /* Main Content Area */
        .content-area {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
        }

        .upload-section {
          flex-basis: 150px;
          margin-bottom: 20px;
        }

        .file-input {
          padding: 10px;
          margin-right: 10px;
        }

        .reader-section {
          flex-grow: 1;
          overflow-y: auto;
          border: 1px solid #e2e6ea;
          padding: 20px;
          border-radius: 6px;
          background-color: #ffffff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .book-reader h2 {
          margin-bottom: 20px;
        }

        .message {
          margin-top: 10px;
          color: #007bff;
        }

        .toggle-sidebar {
          position: absolute;
          left: 10px;
          top: 10px;
          background-color: #007bff;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Books;
