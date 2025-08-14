import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./BlogManagement.module.css";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedBlogs, setExpandedBlogs] = useState(new Set());
  const blogsPerPage = 3;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("Backend URL is not configured");
        }

        const response = await fetch(`${backendUrl}/api/blogs/`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const receivedBlogs = Array.isArray(data)
          ? data
          : data.results || data.items || data.data || [];

        setBlogs(receivedBlogs);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleNext = () => {
    if ((currentPage + 1) * blogsPerPage < blogs.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleBlogExpansion = (blogId) => {
    setExpandedBlogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  const truncateText = (text, maxWords = 50) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const paginatedBlogs = blogs.slice(
    currentPage * blogsPerPage,
    currentPage * blogsPerPage + blogsPerPage
  );

  return (
    <>
      <Head>
        <title>Latest Blogs | Digital Merkato</title>
        <meta name="description" content="Discover our latest blog posts" />
      </Head>

      <main className={styles.container}>
        <h1 className={styles.pageTitle}>Latest Blog Posts</h1>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>Error: {error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className={styles.blogCarouselWrapper}>
            <button
              onClick={handlePrevious}
              className={styles.navButton}
              disabled={currentPage === 0}
            >
              ←
            </button>

            <div className={styles.blogCarousel}>
              {paginatedBlogs.map((blog) => {
                const isExpanded = expandedBlogs.has(blog.id);
                const wordCount = getWordCount(blog.content);
                const shouldShowToggle = wordCount > 50;
                const displayText = shouldShowToggle && !isExpanded 
                  ? truncateText(blog.content, 50) 
                  : blog.content;

                return (
                  <article key={blog.id} className={styles.blogCard}>
                    {blog.image_icon && (
                      <img
                        src={blog.image_icon}
                        alt={blog.title}
                        className={styles.blogImage}
                        onError={(e) => {
                          e.target.src = "/images/placeholder-blog.jpg";
                        }}
                      />
                    )}
                    <div className={styles.blogContent}>
                      <h2>{blog.title}</h2>
                      <p className={`${styles.blogExcerpt} ${isExpanded ? styles.expanded : ''}`}>
                        {displayText}
                      </p>
                      {shouldShowToggle && (
                        <button
                          onClick={() => toggleBlogExpansion(blog.id)}
                          className={styles.seeMoreButton}
                        >
                          {isExpanded ? "See less" : "See more"}
                        </button>
                      )}
                      <div className={styles.blogMeta}>
                        <time dateTime={blog.created_at}>
                          {new Date(blog.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <span
                          className={`${styles.status} ${styles[blog.status]}`}
                        >
                          {blog.status}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className={styles.navButton}
              disabled={(currentPage + 1) * blogsPerPage >= blogs.length}
            >
              →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
