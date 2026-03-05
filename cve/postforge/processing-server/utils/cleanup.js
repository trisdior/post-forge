/**
 * Cleanup Service
 * Auto-delete old temporary files
 * Runs hourly to keep disk space manageable
 */

const fs = require('fs');
const path = require('path');

class CleanupService {
  constructor(uploadDir, clipsDir) {
    this.uploadDir = uploadDir;
    this.clipsDir = clipsDir;
    this.lastCleanup = null;
    this.stats = {
      filesDeleted: 0,
      spacedFreedMB: 0,
      cleanupRuns: 0
    };
  }

  /**
   * Run cleanup (delete old files)
   * @param {number} maxAgeHours - Delete files older than this
   * @returns {object} Cleanup stats
   */
  run(maxAgeHours = 24) {
    const startTime = Date.now();
    const maxAgeMs = maxAgeHours * 3600 * 1000;
    const now = Date.now();

    let filesDeleted = 0;
    let spacedFreed = 0;

    console.log(`[Cleanup] Starting cleanup. Deleting files older than ${maxAgeHours}h`);

    // Clean upload directory
    filesDeleted += this.cleanDirectory(
      this.uploadDir,
      maxAgeMs,
      now,
      (bytes) => { spacedFreed += bytes; }
    );

    // Clean clips directory (delete old working directories)
    filesDeleted += this.cleanDirectory(
      this.clipsDir,
      maxAgeMs,
      now,
      (bytes) => { spacedFreed += bytes; },
      true // Recursively clean subdirectories
    );

    const durationMs = Date.now() - startTime;
    const spacedFreedMB = Math.round(spacedFreed / (1024 * 1024) * 100) / 100;

    this.lastCleanup = {
      timestamp: new Date().toISOString(),
      filesDeleted,
      spacedFreedMB,
      durationMs,
      maxAgeHours
    };

    this.stats.filesDeleted += filesDeleted;
    this.stats.spacedFreedMB += spacedFreedMB;
    this.stats.cleanupRuns += 1;

    console.log(
      `[Cleanup] Completed in ${durationMs}ms. Deleted ${filesDeleted} files, freed ${spacedFreedMB}MB`
    );

    return this.lastCleanup;
  }

  /**
   * Clean a directory recursively
   * @private
   */
  cleanDirectory(dir, maxAgeMs, now, onDeleted, recursive = false) {
    let filesDeleted = 0;

    if (!fs.existsSync(dir)) {
      return filesDeleted;
    }

    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filepath = path.join(dir, file);

        try {
          const stat = fs.statSync(filepath);
          const age = now - stat.mtimeMs;

          if (age > maxAgeMs) {
            if (stat.isDirectory()) {
              // Delete directory and contents
              if (recursive) {
                const size = this.getDirSize(filepath);
                fs.rmSync(filepath, { recursive: true, force: true });
                onDeleted(size);
                filesDeleted++;
              }
            } else {
              // Delete file
              onDeleted(stat.size);
              fs.unlinkSync(filepath);
              filesDeleted++;
            }
          } else if (stat.isDirectory() && recursive) {
            // Recursively clean subdirectories
            filesDeleted += this.cleanDirectory(
              filepath,
              maxAgeMs,
              now,
              onDeleted,
              true
            );
          }
        } catch (error) {
          console.error(`Error processing file ${filepath}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error cleaning directory ${dir}:`, error.message);
    }

    return filesDeleted;
  }

  /**
   * Get directory size in bytes
   * @private
   */
  getDirSize(dir) {
    let size = 0;

    try {
      if (!fs.existsSync(dir)) return 0;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
          size += this.getDirSize(filepath);
        } else {
          size += stat.size;
        }
      }
    } catch (error) {
      console.error(`Error calculating size of ${dir}:`, error.message);
    }

    return size;
  }

  /**
   * Get cleanup stats
   * @returns {object} Stats
   */
  getStats() {
    return {
      ...this.stats,
      lastCleanup: this.lastCleanup
    };
  }

  /**
   * Clean files by pattern (e.g., all temp files)
   * @param {string} dir - Directory to clean
   * @param {RegExp} pattern - File pattern to match
   * @returns {object} Stats
   */
  cleanByPattern(dir, pattern) {
    let filesDeleted = 0;
    let spacedFreed = 0;

    if (!fs.existsSync(dir)) return { filesDeleted, spacedFreedMB: 0 };

    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        if (pattern.test(file)) {
          const filepath = path.join(dir, file);
          const stat = fs.statSync(filepath);

          if (stat.isDirectory()) {
            fs.rmSync(filepath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filepath);
          }

          spacedFreed += stat.size;
          filesDeleted++;
        }
      }
    } catch (error) {
      console.error(`Error cleaning by pattern:`, error.message);
    }

    return {
      filesDeleted,
      spacedFreedMB: Math.round(spacedFreed / (1024 * 1024) * 100) / 100
    };
  }

  /**
   * Delete all temp files (careful!)
   * @param {number} maxAgeHours
   * @returns {object} Stats
   */
  deleteAllTemp(maxAgeHours = 1) {
    return this.run(maxAgeHours);
  }
}

// Global cleanup service
const cleanup = new CleanupService(
  process.env.UPLOAD_DIR || '/tmp/postforge-uploads',
  process.env.CLIPS_DIR || '/tmp/postforge-clips'
);

// Schedule cleanup to run hourly
const CLEANUP_INTERVAL = 3600 * 1000; // 1 hour
setInterval(() => {
  try {
    cleanup.run(24); // Delete files older than 24 hours
  } catch (error) {
    console.error('[Cleanup] Scheduled cleanup failed:', error.message);
  }
}, CLEANUP_INTERVAL);

// Run once on startup
cleanup.run(24);

module.exports = {
  cleanup,
  CleanupService
};
