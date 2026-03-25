const Beat = require('../models/Beat');

exports.getAllBeats = async (req, res) => {
  try {
    const { search, genre, sort, mood } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { producer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { plays: -1 };
    const beats = await Beat.find(query).sort(sortOption);
    res.render('beats/index', { title: 'Browse Beats', beats, search: search || '', genre: genre || '', mood: mood || '', sort: sort || '' });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
};

exports.getBeat = async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    if (!beat) return res.status(404).render('404', { title: '404' });
    beat.plays += 1;
    await beat.save();
    const related = await Beat.find({ genre: beat.genre, _id: { $ne: beat._id } }).limit(3);
    res.render('beats/show', {
      title: beat.title, beat, related, query: req.query,
      paypalClientId: process.env.PAYPAL_CLIENT_ID || 'sb'
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
};

exports.newBeatForm = (req, res) => {
  res.render('beats/new', { title: 'Add New Beat', error: null });
};

exports.createBeat = async (req, res) => {
  try {
    const { title, producer, genre, bpm, price, description, tags, mood, key, license } = req.body;
    const tagsArray = tags ? tags.split(',').map(function(t){ return t.trim(); }).filter(Boolean) : [];
    const beat = new Beat({ title, producer, genre, bpm: Number(bpm), price: Number(price), description, tags: tagsArray, mood, key, license });
    await beat.save();
    res.redirect('/beats/' + beat._id);
  } catch (err) {
    res.render('beats/new', { title: 'Add New Beat', error: err.message });
  }
};

exports.editBeatForm = async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    if (!beat) return res.status(404).render('404', { title: '404' });
    res.render('beats/edit', { title: 'Edit Beat', beat });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
};

exports.updateBeat = async (req, res) => {
  try {
    const { title, producer, genre, bpm, price, description, tags, mood, key, license } = req.body;
    const tagsArray = tags ? tags.split(',').map(function(t){ return t.trim(); }).filter(Boolean) : [];
    await Beat.findByIdAndUpdate(req.params.id, { title, producer, genre, bpm: Number(bpm), price: Number(price), description, tags: tagsArray, mood, key, license });
    res.redirect('/beats/' + req.params.id);
  } catch (err) {
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
};

exports.deleteBeat = async (req, res) => {
  try {
    await Beat.findByIdAndDelete(req.params.id);
    res.redirect('/beats');
  } catch (err) {
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
};

exports.searchBeats = async (req, res) => {
  try {
    const { q } = req.query;
    const beats = await Beat.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { producer: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
