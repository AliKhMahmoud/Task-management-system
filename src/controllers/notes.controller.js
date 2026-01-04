import Note from "../models/note.js";

class NoteController {
  async createNote(req, res) {
    try {
      const { content, task } = req.body;
      if (!content || !task) 
        return res.status(400).json({ message: "Please write the note and specify the task" });

      const note = await Note.create({
        content,
        task,
        author: req.user.id
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Error creating the note", error: error.message });
    }
  }
  async getAllNotes(req, res) {
    try {
      const notes = await Note.find()
        .populate("author", "name")
        .sort({ createdAt: 1 });

      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notes", error: error.message });
    }
  }


  async getNotesByTask(req, res) {
    try {
      const notes = await Note.find({ task: req.params.taskId })
        .populate("author", "name")
        .sort({ createdAt: 1 });

      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notes", error: error.message });
    }
  }

 
  async getNoteById(req, res) {
    try {
      const note = await Note.findById(req.params.id)
        .populate("author", "name");

      if (!note) return res.status(404).json({ message: "Note not found" });

      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ message: "Error fetching note", error: error.message });
    }
  }


  async updateNote(req, res) {
    try {
      const { content } = req.body;
      const note = await Note.findById(req.params.id);

      if (!note) return res.status(404).json({ message: "Note not found" });
      if (note.author.toString() !== req.user.id) 
        return res.status(403).json({ message: "Not authorized" });

      note.content = content || note.content;
      await note.save();

      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ message: "Error updating note", error: error.message });
    }
  }

  
  async deleteNote(req, res) {
    try {
      const note = await Note.findById(req.params.id);

      if (!note) return res.status(404).json({ message: "Note not found" });
      if (note.author.toString() !== req.user.id) 
        return res.status(403).json({ message: "Not authorized" });

      await note.remove();
      res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting note", error: error.message });
    }
  }
}

export default new NoteController();
