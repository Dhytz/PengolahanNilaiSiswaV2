/* ======================================================
       INTRO & TEMA
    ====================================================== */
    (function initIntro() {
        const savedTheme = localStorage.getItem('k7_theme');
        const intro = document.getElementById('introScreen');
        if (savedTheme === 'light') {
            intro.classList.add('intro-light');
            document.documentElement.setAttribute('data-theme','light');
        } else {
            intro.classList.add('intro-dark');
            document.documentElement.setAttribute('data-theme','dark');
        }
        const container = document.getElementById('introParticles');
        for (let i = 0; i < 28; i++) {
            const dot = document.createElement('div');
            dot.className = 'intro-dot';
            dot.style.left = Math.random()*100+'%';
            dot.style.top = Math.random()*100+'%';
            dot.style.animationDelay = Math.random()*3+'s';
            dot.style.animationDuration = (2+Math.random()*2)+'s';
            container.appendChild(dot);
        }
    })();

    let isDark = localStorage.getItem('k7_theme') !== 'light';
    function toggleTheme() {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark?'dark':'light');
        document.querySelector('.theme-toggle').textContent = isDark?'🌙':'☀️';
        localStorage.setItem('k7_theme', isDark?'dark':'light');
    }
    (function(){
        const saved = localStorage.getItem('k7_theme');
        if (saved==='light') { isDark=false; document.documentElement.setAttribute('data-theme','light'); document.querySelector('.theme-toggle').textContent='☀️'; }
    })();

    /* ======================================================
       DATA PERSISTEN
    ====================================================== */
    let daftarSiswa  = JSON.parse(localStorage.getItem('k7_siswa')  || '[]');
    let daftarMapel  = JSON.parse(localStorage.getItem('k7_mapel')  || '[]');
    let daftarNilai  = JSON.parse(localStorage.getItem('k7_nilai')  || '[]');
    let infoSekolah  = JSON.parse(localStorage.getItem('k7_sekolah') || 'null') || {
        nama:'', npsn:'', alamat:'', kota:'', provinsi:'',
        kodePos:'', telepon:'', email:'', website:'',
        kepsek:'', nipKepsek:'', tahunPelajaran:'', semester:'', logo:''
    };

    function simpanState() {
        localStorage.setItem('k7_siswa',   JSON.stringify(daftarSiswa));
        localStorage.setItem('k7_mapel',   JSON.stringify(daftarMapel));
        localStorage.setItem('k7_nilai',   JSON.stringify(daftarNilai));
        localStorage.setItem('k7_sekolah', JSON.stringify(infoSekolah));
    }

    let editingSiswaId = null;
    let editingMapelId = null;
    let editingNilaiId = null;
    let currentRaporSiswaId = null;
    let siswaPage=1, mapelPage=1, nilaiPage=1, legerPage=1;
    function setSiswaPage(p){siswaPage=p;renderSiswaTable();}
    function setMapelPage(p){mapelPage=p;renderMapelList();}
    function setNilaiPage(p){nilaiPage=p;renderNilaiTable();}
    function setLegerPage(p){legerPage=p;renderLeger();}

    /* ======================================================
       VALIDASI INPUT — HURUF & ANGKA
    ====================================================== */
    /** Hanya huruf dan spasi (untuk nama orang) */
    function filterNama(el) {
        const val = el.value;
        el.value = val.replace(/[^a-zA-ZÀ-öø-ÿ\s'.,-]/g, '');
        validasiHuruf(el, el.placeholder.replace('Masukkan ','').replace('...',''));
    }

    /** Huruf, spasi, angka Romawi, tanda baca umum (untuk nama mapel / nama sekolah) */
    function filterHurufSekolah(el) {
        const val = el.value;
        el.value = val.replace(/[^a-zA-ZÀ-öø-ÿ0-9\s'.,()/-]/g, '');
    }

    /** Hanya angka */
    function filterAngka(el) {
        const val = el.value;
        el.value = val.replace(/\D/g,'');
        if (el.value.length > 0) {
            el.classList.remove('input-error'); el.classList.add('input-ok');
        } else {
            el.classList.remove('input-ok');
        }
    }

    /** Validasi blur: field harus mengandung huruf*/
    function validasiHuruf(el, label) {
        const val = el.value.trim();
        if (val.length > 0 && /\d/.test(val)) {
            el.classList.add('input-error'); el.classList.remove('input-ok');
            showToast(`${label} tidak boleh mengandung angka!`, 'error');
            return false;
        }
        if (val.length > 0) { el.classList.remove('input-error'); el.classList.add('input-ok'); }
        else { el.classList.remove('input-error','input-ok'); }
        return true;
    }

    /** Validasi blur: field harus angka saja */
    function validasiAngka(el, label) {
        const val = el.value.trim();
        if (val.length > 0 && /\D/.test(val)) {
            el.classList.add('input-error'); el.classList.remove('input-ok');
            showToast(`${label} hanya boleh berisi angka!`, 'error');
            return false;
        }
        if (val.length > 0) { el.classList.remove('input-error'); el.classList.add('input-ok'); }
        else { el.classList.remove('input-error','input-ok'); }
        return true;
    }

    // Validasi blur khusus KKM
    function validasiKKM(el) {
        const val = el.value.trim();
        if (val.length > 0 && (/\D/.test(val) || parseInt(val) < 0 || parseInt(val) > 100)) {
            el.classList.add('input-error'); el.classList.remove('input-ok');
            showToast(`KKM harus berupa angka antara 0–100!`, 'error');
            return false;
        }
        if (val.length > 0) { el.classList.remove('input-error'); el.classList.add('input-ok'); }
        else { el.classList.remove('input-error','input-ok'); }
        return true;
    }
    /* ======================================================
       INFO SEKOLAH
    ====================================================== */
    function simpanInfoSekolah() {
    const npsn     = document.getElementById('sekolahNPSN').value.trim();
    const nama     = document.getElementById('sekolahNama').value.trim();
    const alamat   = document.getElementById('sekolahAlamat').value.trim();
    const kota     = document.getElementById('sekolahKota').value;
    const provinsi = document.getElementById('sekolahProvinsi').value.trim();
    const kodePos  = document.getElementById('sekolahKodePOS').value.trim();
    const telepon  = document.getElementById('sekolahTelepon').value.trim();
    const email    = document.getElementById('sekolahEmail').value.trim();
    const website  = document.getElementById('sekolahWebsite').value.trim();
    const nipK     = document.getElementById('sekolahNIPKepsek').value.trim();
    const kepsek   = document.getElementById('sekolahKepsek').value.trim();
    const tahun    = document.getElementById('sekolahTahunPelajaran').value.trim();
    const semester = document.getElementById('sekolahSemester').value;

    // Validasi
    if (!nama) { showToast('Nama Sekolah wajib diisi!', 'error'); return; }
    if (!alamat) { showToast('Alamat Sekolah wajib diisi!', 'error'); return; }
    if (!kota) { showToast('Kota/Kabupaten wajib diisi!', 'error'); return; }
    if (!provinsi) { showToast('Provinsi wajib diisi!', 'error'); return; }
    if (/\d/.test(nama)) { showToast('Nama Sekolah tidak boleh mengandung angka!', 'error'); return; }
    if (npsn && (/\D/.test(npsn) || npsn.length !== 8)) { showToast('NPSN harus 8 digit angka!', 'error'); return; }
    if (kodePos && /\D/.test(kodePos)) { showToast('Kode POS hanya boleh berisi angka!', 'error'); return; }
    if (telepon && /\D/.test(telepon)) { showToast('Nomor Telepon hanya boleh berisi angka!', 'error'); return; }
    if (kepsek && /\d/.test(kepsek)) { showToast('Nama Kepala Sekolah tidak boleh mengandung angka!', 'error'); return; }
    if (nipK && /\D/.test(nipK)) { showToast('NIP Kepala Sekolah hanya boleh berisi angka!', 'error'); return; }

    // Simpan Data (pertahankan logo yang sudah ada)
    const logoLama = infoSekolah.logo || '';
    infoSekolah = { nama, npsn, alamat, kota, provinsi, kodePos, telepon, email, website,
                    kepsek, nipKepsek:nipK, tahunPelajaran:tahun, semester, logo:logoLama };
    simpanState();
    showToast('Informasi sekolah berhasil disimpan!', 'success');
    renderSekolahPreview();

    // Reset semua input
    ['sekolahNama','sekolahNPSN','sekolahAlamat','sekolahTelepon','sekolahEmail','sekolahWebsite',
     'sekolahKepsek','sekolahNIPKepsek','sekolahTahunPelajaran'].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = '';
    });
    document.getElementById('sekolahSemester').selectedIndex = 0;
    // Reset cascade comboboxes
    document.getElementById('sekolahProvinsi').selectedIndex = 0;
    const kotaEl=document.getElementById('sekolahKota'); kotaEl.innerHTML='<option value="">— Pilih Provinsi terlebih dahulu —</option>'; kotaEl.disabled=true;
    const posEl=document.getElementById('sekolahKodePOS'); posEl.innerHTML='<option value="">— Pilih Kota/Kabupaten terlebih dahulu —</option>'; posEl.disabled=true;
}

    function loadInfoSekolahForm() {
        initProvinsiSelect();
        document.getElementById('sekolahNama').value = infoSekolah.nama || '';
        document.getElementById('sekolahNPSN').value = infoSekolah.npsn || '';
        document.getElementById('sekolahAlamat').value = infoSekolah.alamat || '';
        // Kota, Provinsi, KodePOS are managed by cascade combobox (initProvinsiSelect)
        document.getElementById('sekolahTelepon').value = infoSekolah.telepon || '';
        document.getElementById('sekolahEmail').value = infoSekolah.email || '';
        document.getElementById('sekolahWebsite').value = infoSekolah.website || '';
        document.getElementById('sekolahKepsek').value = infoSekolah.kepsek || '';
        document.getElementById('sekolahNIPKepsek').value = infoSekolah.nipKepsek || '';
        document.getElementById('sekolahTahunPelajaran').value = infoSekolah.tahunPelajaran || '';
        document.getElementById('sekolahSemester').value = infoSekolah.semester || '';
        // Load logo if saved
        if (infoSekolah.logo) {
            const img = document.getElementById('logoPreviewImg');
            const txt = document.getElementById('logoPreviewText');
            const btn = document.getElementById('logoHapusBtn');
            if(img){ img.src = infoSekolah.logo; img.style.display = 'block'; }
            if(txt) txt.style.display = 'none';
            if(btn) btn.style.display = 'inline-block';
        }
        if (infoSekolah.nama) renderSekolahPreview();
    }

    function renderSekolahPreview() {
        const card = document.getElementById('sekolahPreviewCard');
        const el   = document.getElementById('sekolahPreviewContent');
        card.style.display = 'block';
        el.innerHTML = _kopRaporHTML();
    }

    /** Menghasilkan HTML kop rapor formal */
    function _kopRaporHTML() {
        const s = infoSekolah;
        const nama = s.nama || 'NAMA SEKOLAH';
        const npsn = s.npsn ? `NPSN: ${s.npsn}` : '';
        const parts = [];
        if (s.alamat) parts.push(s.alamat);
        const lokasi = [s.kota, s.provinsi].filter(Boolean).join(', ');
        if (lokasi) parts.push(lokasi);
        if (s.kodePos) parts.push(`Kode Pos ${s.kodePos}`);
        const alamatLine = parts.join(', ');
        const kontakParts = [];
        if (s.telepon) kontakParts.push(`Telp: ${s.telepon}`);
        if (s.email) kontakParts.push(`Email: ${s.email}`);
        if (s.website) kontakParts.push(`Web: ${s.website}`);
        const kontakLine = kontakParts.join('  |  ');
        const logoSrc = s.logo || '';
        const logoEl = logoSrc
            ? `<img src="${logoSrc}" style="width:72px;height:72px;object-fit:contain;border-radius:6px;object-fit:cover;border-radius:50%;">`
            : `<div style="width:72px;height:72px;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.58rem;color:#999;text-align:center;border:2px solid #ccc;">Logo<br>Sekolah</div>`;
        return `
        <div style="background:#fff;padding:16px 24px 12px;border-bottom:4px double #003087;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="display:flex;align-items:center;gap:16px;">
                <div style="flex-shrink:0;">${logoEl}</div>
                <div style="text-align:center;flex:1;">
                    <div style="font-size:0.68rem;font-weight:700;letter-spacing:2.5px;color:#333;text-transform:uppercase;line-height:1.7;">PEMERINTAH PROVINSI ${s.provinsi || ''}</div>
                    <div style="font-size:0.68rem;font-weight:700;letter-spacing:2.5px;color:#333;text-transform:uppercase;margin-bottom:4px;line-height:1.7;">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
                    <div style="font-size:1.25rem;font-weight:900;color:#000000;letter-spacing:0.5px;text-transform:uppercase;line-height:1.2;">${nama}</div>
                    ${npsn ? `<div style="font-size:0.68rem;color:#555;margin-top:3px;">${npsn}</div>` : ''}
                    ${alamatLine ? `<div style="font-size:0.68rem;color:#444;margin-top:2px;">${alamatLine}</div>` : ''}
                    ${kontakLine ? `<div style="font-size:0.65rem;color:#555;margin-top:2px;">${kontakLine}</div>` : ''}
                </div>
                <div style="width:72px;height:72px;object-fit:contain;border-radius:6px;object-fit:cover;border-radius:50%;"><img src="tut wuri handayani.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></img></div>
            </div>
        </div>`;
    }


    /* ======================================================
       VALIDASI INPUT TAMBAHAN
    ====================================================== */
    /** Filter alamat: huruf, angka, spasi, dan tanda baca umum */
    function filterAlamat(el) {
        el.value = el.value.replace(/[^a-zA-Z0-9À-öø-ÿ\s.,/()\-]/g, '');
    }

    /** Filter email: izinkan karakter email valid */
    function filterEmail(el) {
        el.value = el.value.replace(/[^a-zA-Z0-9@._+\-]/g, '');
    }

    /** Filter website: izinkan karakter URL valid */
    function filterWebsite(el) {
        el.value = el.value.replace(/[^a-zA-Z0-9.:/_?&=#%\-]/g, '');
    }

    /** Filter tahun pelajaran: format XXXX/XXXX */
    function filterTahunPelajaran(el) {
        let v = el.value.replace(/[^0-9/]/g, '');
        el.value = v;
    }

    /** Validasi email format */
    function validasiEmail(el) {
        const val = el.value.trim();
        if (!val) { el.classList.remove('input-error','input-ok'); return true; }
        const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
        el.classList.toggle('input-error', !valid);
        el.classList.toggle('input-ok', valid);
        if (!valid) showToast('Format email tidak valid!','error');
        return valid;
    }

    /** Validasi website format */
    function validasiWebsite(el) {
        const val = el.value.trim();
        if (!val) { el.classList.remove('input-error','input-ok'); return true; }
        const valid = /^(https?:\/\/|www\.)?[\w\-]+(\.[\w\-]+)+([\/\w\-._~:?#\[\]@!$&'()*+,;=%]*)?$/.test(val);
        el.classList.toggle('input-error', !valid);
        el.classList.toggle('input-ok', valid);
        return valid;
    }

    /** Validasi tahun pelajaran format: XXXX/XXXX */
    function validasiTahunPelajaran(el) {
        const val = el.value.trim();
        if (!val) { el.classList.remove('input-error','input-ok'); return true; }
        const valid = /^\d{4}\/\d{4}$/.test(val);
        el.classList.toggle('input-error', !valid);
        el.classList.toggle('input-ok', valid);
        if (!valid && val.length >= 4) showToast('Format Tahun Pelajaran: XXXX/XXXX (contoh: 2024/2025)', 'warning');
        return valid;
    }


    /* ======================================================
       DATA WILAYAH INDONESIA (Provinsi → Kota → Kode Pos)
    ====================================================== */
    const INDO_WILAYAH = {
      'Aceh': {
        kota: ['Banda Aceh','Sabang','Langsa','Lhokseumawe','Subulussalam','Aceh Besar','Aceh Barat','Aceh Selatan','Aceh Tengah','Aceh Tenggara','Aceh Timur','Aceh Utara','Bener Meriah','Bireuen','Gayo Lues','Nagan Raya','Pidie','Pidie Jaya','Simeulue'],
        pos: { 'Banda Aceh':['23111','23112','23113','23114','23115','23116','23117','23118','23121','23122'], 'Sabang':['23511','23512','23513'], 'Langsa':['24411','24412','24413','24414','24415','24416','24417'], 'Lhokseumawe':['24311','24312','24313','24314','24315','24351','24352','24353','24354','24355'], 'Subulussalam':['23771','23772','23773','23774','23775'], 'Aceh Besar':['23360','23361','23362','23363','23364','23365','23366'], 'Aceh Barat':['23614','23615','23616','23617','23618','23619','23651','23652','23653'], 'Aceh Selatan':['23711','23712','23713','23714','23715','23719','23721','23722'], 'Aceh Tengah':['24511','24512','24513','24514','24515','24516','24517'], 'Aceh Tenggara':['24611','24612','24613','24614','24615','24616','24617'], 'Aceh Timur':['24451','24452','24453','24454','24455','24456','24457','24458'], 'Aceh Utara':['24351','24352','24353','24354','24355','24356','24357','24358'], 'Bener Meriah':['24581','24582','24583','24584','24585','24586','24587'], 'Bireuen':['24251','24252','24253','24254','24255','24256','24257','24258'], 'Gayo Lues':['24651','24652','24653','24654','24655','24656','24657'], 'Nagan Raya':['23661','23662','23663','23664','23665','23666','23667'], 'Pidie':['24111','24112','24113','24114','24115','24116','24117','24118'], 'Pidie Jaya':['24181','24182','24183','24184','24185','24186'], 'Simeulue':['23891','23892','23893','23894','23895','23896','23897'] }
      },
      'Sumatera Utara': {
        kota: ['Medan','Binjai','Tebing Tinggi','Pematangsiantar','Tanjungbalai','Padang Sidempuan','Gunungsitoli','Asahan','Batu Bara','Dairi','Deli Serdang','Humbang Hasundutan','Karo','Labuhan Batu','Labuhan Batu Selatan','Labuhan Batu Utara','Langkat','Mandailing Natal','Nias','Nias Barat','Nias Selatan','Nias Utara','Padang Lawas','Padang Lawas Utara','Pakpak Bharat','Samosir','Serdang Bedagai','Simalungun','Tapanuli Selatan','Tapanuli Tengah','Tapanuli Utara','Toba Samosir'],
        pos: { 'Medan':['20111','20112','20113','20114','20115','20116','20117','20118','20119','20121','20122','20123','20124','20125','20126','20127','20128','20129','20131','20132'], 'Binjai':['20711','20712','20713','20714','20715','20716','20717','20718','20719','20721'], 'Tebing Tinggi':['20611','20612','20613','20614','20615','20616','20617','20618','20619','20621'], 'Pematangsiantar':['21111','21112','21113','21114','21115','21116','21117','21118','21119','21121'], 'Tanjungbalai':['21311','21312','21313','21314','21315','21316','21317','21318','21319'], 'Padang Sidempuan':['22711','22712','22713','22714','22715','22716','22717','22718','22719','22721'], 'Gunungsitoli':['22811','22812','22813','22814','22815','22816','22817','22818','22819'], 'Deli Serdang':['20511','20512','20513','20514','20515','20516','20517','20518','20519','20521'], 'Langkat':['20811','20812','20813','20814','20815','20816','20817','20818','20819','20821'], 'Simalungun':['21151','21152','21153','21154','21155','21156','21157','21158','21159'], 'Karo':['22111','22112','22113','22114','22115','22116','22117','22118','22119'] }
      },
      'Sumatera Barat': {
        kota: ['Padang','Bukittinggi','Payakumbuh','Sawahlunto','Solok','Padang Panjang','Pariaman','Agam','Dharmasraya','Kepulauan Mentawai','Lima Puluh Kota','Padang Pariaman','Pasaman','Pasaman Barat','Pesisir Selatan','Sijunjung','Solok Selatan','Tanah Datar'],
        pos: { 'Padang':['25111','25112','25113','25114','25115','25116','25117','25118','25119','25121','25122','25123','25124','25125','25126','25127','25128','25129','25131','25132'], 'Bukittinggi':['26111','26112','26113','26114','26115','26116','26117','26118','26119','26121'], 'Payakumbuh':['26211','26212','26213','26214','26215','26216','26217','26218','26219'], 'Sawahlunto':['27411','27412','27413','27414','27415','27416','27417'], 'Solok':['27311','27312','27313','27314','27315','27316','27317','27318','27319'], 'Padang Panjang':['27118','27119','27121','27122','27123','27124','27125','27126'] }
      },
      'Riau': {
        kota: ['Pekanbaru','Dumai','Bengkalis','Indragiri Hilir','Indragiri Hulu','Kampar','Kepulauan Meranti','Kuantan Singingi','Pelalawan','Rokan Hilir','Rokan Hulu','Siak'],
        pos: { 'Pekanbaru':['28111','28112','28113','28114','28115','28116','28117','28118','28119','28121','28122','28123','28124','28125','28126','28127','28128','28129','28131','28132'], 'Dumai':['28811','28812','28813','28814','28815','28816','28817','28818','28819','28821'], 'Bengkalis':['28711','28712','28713','28714','28715','28716','28717','28718','28719'], 'Kampar':['28411','28412','28413','28414','28415','28416','28417','28418','28419'] }
      },
      'Kepulauan Riau': {
        kota: ['Tanjung Pinang','Batam','Bintan','Karimun','Kepulauan Anambas','Lingga','Natuna'],
        pos: { 'Tanjung Pinang':['29111','29112','29113','29114','29115','29116','29117','29118','29119','29121'], 'Batam':['29411','29412','29413','29414','29415','29416','29417','29418','29419','29421','29422','29423','29424','29425','29426','29427','29428','29429','29431','29432','29433','29434','29435','29436','29437','29438','29439','29441','29442','29443','29444','29445','29461','29462','29463','29464','29465'], 'Bintan':['29151','29152','29153','29154','29155','29156','29157','29158','29159'], 'Karimun':['29611','29612','29613','29614','29615','29616','29617','29618','29619'] }
      },
      'Jambi': {
        kota: ['Jambi','Sungai Penuh','Batanghari','Bungo','Kerinci','Merangin','Muaro Jambi','Sarolangun','Tanjung Jabung Barat','Tanjung Jabung Timur','Tebo'],
        pos: { 'Jambi':['36111','36112','36113','36114','36115','36116','36117','36118','36119','36121','36122','36123','36124','36125','36126','36127','36128','36129','36131','36132'], 'Sungai Penuh':['37111','37112','37113','37114','37115','37116','37117'], 'Batanghari':['36611','36612','36613','36614','36615','36616','36617','36618','36619'] }
      },
      'Sumatera Selatan': {
        kota: ['Palembang','Lubuk Linggau','Prabumulih','Pagar Alam','Banyuasin','Empat Lawang','Lahat','Muara Enim','Musi Banyuasin','Musi Rawas','Musi Rawas Utara','Ogan Ilir','Ogan Komering Ilir','Ogan Komering Ulu','Ogan Komering Ulu Selatan','Ogan Komering Ulu Timur','Penukal Abab Lematang Ilir'],
        pos: { 'Palembang':['30111','30112','30113','30114','30115','30116','30117','30118','30119','30121','30122','30123','30124','30125','30126','30127','30128','30129','30131','30132'], 'Lubuk Linggau':['31611','31612','31613','31614','31615','31616','31617','31618','31619','31621'], 'Prabumulih':['31111','31112','31113','31114','31115','31116','31117','31118','31119','31121'], 'Pagar Alam':['31511','31512','31513','31514','31515','31516','31517','31518','31519'] }
      },
      'Bengkulu': {
        kota: ['Bengkulu','Bengkulu Selatan','Bengkulu Tengah','Bengkulu Utara','Kaur','Kepahiang','Lebong','Mukomuko','Rejang Lebong','Seluma'],
        pos: { 'Bengkulu':['38111','38112','38113','38114','38115','38116','38117','38118','38119','38121','38122','38123','38124','38125','38126','38127','38128','38129','38211','38212','38213','38214','38215'], 'Bengkulu Selatan':['38511','38512','38513','38514','38515','38516','38517','38518','38519'], 'Rejang Lebong':['39111','39112','39113','39114','39115','39116','39117','39118','39119'] }
      },
      'Lampung': {
        kota: ['Bandar Lampung','Metro','Lampung Barat','Lampung Selatan','Lampung Tengah','Lampung Timur','Lampung Utara','Mesuji','Pesawaran','Pesisir Barat','Pringsewu','Tanggamus','Tulang Bawang','Tulang Bawang Barat','Way Kanan'],
        pos: { 'Bandar Lampung':['35111','35112','35113','35114','35115','35116','35117','35118','35119','35121','35122','35123','35124','35125','35126','35127','35128','35129','35131','35132'], 'Metro':['34111','34112','34113','34114','34115','34116','34117','34118','34119','34121','34122','34123','34124','34125','34126','34127','34128','34129','34131','34132'], 'Lampung Selatan':['35511','35512','35513','35514','35515','35516','35517','35518','35519'], 'Lampung Tengah':['34161','34162','34163','34164','34165','34166','34167','34168','34169'] }
      },
      'Kepulauan Bangka Belitung': {
        kota: ['Pangkal Pinang','Bangka','Bangka Barat','Bangka Selatan','Bangka Tengah','Belitung','Belitung Timur'],
        pos: { 'Pangkal Pinang':['33111','33112','33113','33114','33115','33116','33117','33118','33119','33121','33122','33123','33124','33125','33126','33127','33128','33129','33131','33132'], 'Bangka':['33211','33212','33213','33214','33215','33216','33217','33218','33219'], 'Belitung':['33411','33412','33413','33414','33415','33416','33417','33418','33419'] }
      },
      'DKI Jakarta': {
        kota: ['Jakarta Pusat','Jakarta Utara','Jakarta Barat','Jakarta Selatan','Jakarta Timur','Kepulauan Seribu'],
        pos: { 'Jakarta Pusat':['10110','10120','10130','10140','10150','10160','10170','10180','10190','10210','10220','10230','10240','10250','10260','10270','10310','10320','10330','10340','10350','10360','10410','10420','10430','10440','10450','10460','10470','10510','10520','10530','10540','10550','10560','10570'], 'Jakarta Utara':['14110','14120','14130','14140','14150','14210','14220','14230','14240','14250','14260','14310','14320','14330','14340','14350','14360','14410','14420','14430','14440','14450','14460','14470'], 'Jakarta Barat':['11110','11120','11130','11140','11150','11160','11170','11210','11220','11230','11240','11250','11310','11320','11330','11340','11350','11410','11420','11430','11440','11450','11510','11520','11530','11540','11550','11560','11610','11620','11630','11640','11650','11710','11720','11730','11740','11750','11810','11820','11830','11840','11850','11910','11920','11930','11940','11950','11960'], 'Jakarta Selatan':['12110','12120','12130','12140','12150','12160','12170','12180','12210','12220','12230','12240','12250','12260','12270','12310','12320','12330','12340','12350','12360','12410','12420','12430','12440','12450','12460','12510','12520','12530','12540','12550','12560','12610','12620','12630','12640','12650','12710','12720','12730','12740','12750','12810','12820','12830','12840','12850','12910','12920','12930','12940','12950','12960','12970','13010'], 'Jakarta Timur':['13110','13120','13130','13140','13150','13210','13220','13230','13240','13250','13310','13320','13330','13340','13350','13410','13420','13430','13440','13450','13460','13510','13520','13530','13540','13550','13560','13610','13620','13630','13640','13650','13710','13720','13730','13740','13750','13810','13820','13830','13840','13850','13860','13910','13920','13930','13940','13950','13960','13970'], 'Kepulauan Seribu':['14510','14511','14512'] }
      },
      'Jawa Barat': {
        kota: ['Bandung','Bekasi','Bogor','Cimahi','Cirebon','Depok','Sukabumi','Tasikmalaya','Banjar','Bandung Barat','Ciamis','Cianjur','Garut','Indramayu','Karawang','Kuningan','Majalengka','Pangandaran','Purwakarta','Subang','Sukabumi Kab','Sumedang','Tasikmalaya Kab'],
        pos: { 'Bandung':['40111','40112','40113','40114','40115','40116','40117','40118','40119','40121','40122','40123','40124','40125','40126','40127','40128','40129','40131','40132','40133','40134','40135','40136','40137','40138','40139','40141','40142','40143','40144','40145','40146','40147','40148','40149','40151','40152','40153','40154','40155','40156','40157','40158','40159','40161','40162','40163','40164','40165','40166','40167','40168','40169','40171','40172','40173','40174','40175','40176','40177','40178','40179','40181','40182'], 'Bekasi':['17111','17112','17113','17114','17115','17116','17117','17118','17119','17121','17122','17123','17124','17125','17126','17127','17128','17129','17131','17132','17133','17134','17135','17136','17137','17138','17139','17141','17142','17143','17144','17145','17146','17147','17148','17149','17151','17152','17153','17154','17155','17156','17157','17158','17159','17161','17162','17163','17164','17165','17166','17167','17168','17169','17171'], 'Bogor':['16111','16112','16113','16114','16115','16116','16117','16118','16119','16121','16122','16123','16124','16125','16126','16127','16128','16129','16131','16132','16133','16134','16135','16136','16137','16138','16139','16141','16142','16143','16144','16145','16146','16147','16148','16149','16151','16152','16153','16154','16155','16156','16157','16158','16159','16161','16162','16163','16164','16165','16166'], 'Cimahi':['40511','40512','40513','40514','40515','40516','40517','40518','40519','40521','40522','40523','40524','40525','40526','40527','40528','40529','40531','40532','40533','40534','40535'], 'Cirebon':['45111','45112','45113','45114','45115','45116','45117','45118','45119','45121','45122','45123','45124','45125','45126','45127','45128','45129','45131','45132','45133','45134','45135','45136','45137','45138','45139'], 'Depok':['16411','16412','16413','16414','16415','16416','16417','16418','16419','16421','16422','16423','16424','16425','16426','16427','16428','16429','16431','16432','16433','16434','16435','16436','16437','16438','16439','16441','16442','16443','16444','16445','16446','16447','16448','16449','16451','16452','16453','16454','16455','16456','16457','16458','16459','16461','16462','16463','16464','16465','16466','16467','16468','16469','16471','16472','16473','16474','16475'], 'Sukabumi':['43111','43112','43113','43114','43115','43116','43117','43118','43119','43121','43122','43123','43124','43125','43126','43127','43128','43129','43131','43132','43133','43134','43135','43136','43137','43138','43139'], 'Tasikmalaya':['46111','46112','46113','46114','46115','46116','46117','46118','46119','46121','46122','46123','46124','46125','46126','46127','46128','46129','46131','46132','46133','46134','46135'], 'Karawang':['41311','41312','41313','41314','41315','41316','41317','41318','41319','41321','41322','41323','41324','41325','41326','41327','41328','41329','41331','41332'] }
      },
      'Jawa Tengah': {
        kota: ['Semarang','Surakarta','Magelang','Pekalongan','Salatiga','Tegal','Banjarnegara','Banyumas','Batang','Blora','Boyolali','Brebes','Cilacap','Demak','Grobogan','Jepara','Karanganyar','Kebumen','Kendal','Klaten','Kudus','Magelang Kab','Pati','Pekalongan Kab','Pemalang','Purbalingga','Purworejo','Rembang','Semarang Kab','Sragen','Sukoharjo','Tegal Kab','Temanggung','Wonogiri','Wonosobo'],
        pos: { 'Semarang':['50111','50112','50113','50114','50115','50116','50117','50118','50119','50121','50122','50123','50124','50125','50126','50127','50128','50129','50131','50132','50133','50134','50135','50136','50137','50138','50139','50141','50142','50143','50144','50145','50146','50147','50148','50149','50151','50152','50153','50154','50155','50156','50157','50158','50159','50161','50162','50163','50164','50165','50166','50167','50168','50169','50171','50172','50173','50174','50175','50176','50177','50178','50179','50181','50182','50183','50184','50185','50186','50187','50188','50189','50191','50192','50193','50194','50195','50196','50197','50198','50199','50211','50212','50213','50214','50215','50216','50217','50218','50219','50221','50222','50223','50224','50225','50226','50227','50228','50229','50231','50232','50233','50234','50235','50236','50237','50238','50239','50241','50242','50243','50244','50245'], 'Surakarta':['57111','57112','57113','57114','57115','57116','57117','57118','57119','57121','57122','57123','57124','57125','57126','57127','57128','57129','57131','57132','57133','57134','57135','57136','57137','57138','57139','57141','57142','57143','57144','57145','57146','57147','57148','57149','57151','57152','57153','57154','57155','57156','57157','57158','57159'], 'Magelang':['56111','56112','56113','56114','56115','56116','56117','56118','56119','56121','56122','56123','56124','56125','56126','56127','56128','56129','56131','56132'], 'Pekalongan':['51111','51112','51113','51114','51115','51116','51117','51118','51119','51121','51122','51123','51124','51125','51126','51127','51128','51129','51131','51132','51133','51134','51135','51136','51137','51138','51139'], 'Tegal':['52111','52112','52113','52114','52115','52116','52117','52118','52119','52121','52122','52123','52124','52125','52126','52127','52128','52129','52131','52132','52133','52134','52135','52136'], 'Klaten':['57411','57412','57413','57414','57415','57416','57417','57418','57419','57421','57422','57423','57424','57425','57426','57427','57428','57429','57431','57432','57433','57434','57435','57436','57437','57438','57439','57441','57442','57443','57444','57445','57446','57447','57448','57449','57451','57452','57453','57454','57455','57456','57457','57458','57459','57461','57462','57463','57464','57465','57466','57467','57468','57469','57471','57472','57473','57474','57475','57476','57477','57478','57479','57481','57482','57483','57484','57485','57486'], 'Kudus':['59311','59312','59313','59314','59315','59316','59317','59318','59319','59321','59322','59323','59324','59325','59326','59327','59328','59329','59331','59332','59333','59334','59335','59336','59337','59338','59339'], 'Boyolali':['57311','57312','57313','57314','57315','57316','57317','57318','57319','57321','57322','57323','57324','57325','57326','57327','57328','57329','57331','57332'] }
      },
      'DI Yogyakarta': {
        kota: ['Yogyakarta','Bantul','Gunungkidul','Kulon Progo','Sleman'],
        pos: { 'Yogyakarta':['55111','55112','55113','55114','55115','55116','55117','55118','55119','55121','55122','55123','55124','55125','55126','55127','55128','55129','55131','55132','55133','55134','55135','55136','55137','55138','55139','55141','55142','55143','55144','55145','55146','55147','55148','55149','55151','55152','55153','55154','55155','55156','55157','55158','55159','55161','55162','55163','55164','55165','55166','55167','55168','55169','55171','55172','55173','55174','55175','55176','55177','55178','55179','55181','55182','55183','55184','55185','55186','55187','55188','55189','55191','55192','55193','55194','55195','55196','55197','55198','55199','55211','55212','55213','55214','55215','55216','55217','55218','55219','55221','55222','55223','55224','55225','55226','55227','55228','55229'], 'Bantul':['55711','55712','55713','55714','55715','55716','55717','55718','55719','55721','55722','55723','55724','55725','55726','55727','55728','55729','55731','55732','55733','55734','55735','55736','55737','55738','55739','55741','55742','55743','55744','55745','55746','55747','55748','55749','55751','55752','55753','55754','55755','55756','55757','55758','55759','55761','55762','55763','55764','55765','55766','55767','55768','55769','55771','55772','55773','55774','55775','55776','55777','55778','55779','55781','55782','55783','55784','55785','55786','55787'], 'Sleman':['55511','55512','55513','55514','55515','55516','55517','55518','55519','55521','55522','55523','55524','55525','55526','55527','55528','55529','55531','55532','55533','55534','55535','55536','55537','55538','55539','55541','55542','55543','55544','55545','55546','55547','55548','55549','55551','55552','55553','55554','55555','55556','55557','55558','55559','55561','55562','55563','55564','55565','55566','55567','55568','55569','55571','55572','55573','55574','55575','55576','55577','55578','55579','55581','55582','55583','55584','55585','55586','55587','55588','55589','55591','55592','55593','55594','55595','55596','55597','55598','55599','55611','55612','55613'], 'Gunungkidul':['55811','55812','55813','55814','55815','55816','55817','55818','55819','55821','55822','55823','55824','55825','55826','55827','55828','55829','55831','55832','55833','55834','55835','55836','55837','55838','55839','55841','55842','55843','55844','55845','55846','55847','55848','55849','55851','55852','55853','55854','55855','55856','55857','55858','55859','55861','55862','55863','55864','55865','55866','55867','55868','55869','55871','55872','55873','55874','55875','55876','55877','55878','55879','55881','55882','55883','55884','55885','55886','55887','55888','55889'], 'Kulon Progo':['55611','55612','55613','55614','55615','55616','55617','55618','55619','55621','55622','55623','55624','55625','55626','55627','55628','55629','55631','55632','55633','55634','55635','55636','55637','55638','55639','55641','55642','55643','55644','55645','55646','55647','55648','55649','55651','55652','55653','55654','55655','55656','55657','55658','55659','55661','55662','55663','55664','55665','55666','55667','55668','55669'] }
      },
      'Jawa Timur': {
        kota: ['Surabaya','Malang','Kediri','Blitar','Madiun','Mojokerto','Pasuruan','Probolinggo','Batu','Bangkalan','Banyuwangi','Blitar Kab','Bojonegoro','Bondowoso','Gresik','Jember','Jombang','Kediri Kab','Lamongan','Lumajang','Madiun Kab','Magetan','Malang Kab','Mojokerto Kab','Nganjuk','Ngawi','Pacitan','Pamekasan','Pasuruan Kab','Ponorogo','Probolinggo Kab','Sampang','Sidoarjo','Situbondo','Sumenep','Trenggalek','Tuban','Tulungagung'],
        pos: { 'Surabaya':['60111','60112','60113','60114','60115','60116','60117','60118','60119','60121','60122','60123','60124','60125','60126','60127','60128','60129','60131','60132','60133','60134','60135','60136','60137','60138','60139','60141','60142','60143','60144','60145','60146','60147','60148','60149','60151','60152','60153','60154','60155','60156','60157','60158','60159','60161','60162','60163','60164','60165','60166','60167','60168','60169','60171','60172','60173','60174','60175','60176','60177','60178','60179','60181','60182','60183','60184','60185','60186','60187','60188','60189','60191','60192','60193','60194','60195','60196','60197','60198','60199','60211','60212','60213','60214','60215','60216','60217','60218','60219','60221','60222','60223','60224','60225','60226','60227','60228','60229','60231','60232','60233','60234','60235','60236','60237','60238','60239','60241','60242','60243','60244','60245','60246','60247','60248','60249','60251','60252','60253','60254','60255','60256','60257','60258','60259','60261','60262','60263','60264','60265','60266','60267','60268','60269','60271','60272','60273','60274','60275','60276','60277','60278','60279','60281','60282','60283','60284','60285','60286','60287','60288','60289','60291','60292','60293','60294','60295'], 'Malang':['65111','65112','65113','65114','65115','65116','65117','65118','65119','65121','65122','65123','65124','65125','65126','65127','65128','65129','65131','65132','65133','65134','65135','65136','65137','65138','65139','65141','65142','65143','65144','65145','65146','65147','65148','65149','65151','65152','65153','65154','65155','65156','65157','65158','65159','65161','65162','65163','65164','65165','65166'], 'Kediri':['64111','64112','64113','64114','64115','64116','64117','64118','64119','64121','64122','64123','64124','64125','64126','64127','64128','64129','64131','64132','64133','64134','64135','64136','64137','64138','64139'], 'Sidoarjo':['61211','61212','61213','61214','61215','61216','61217','61218','61219','61221','61222','61223','61224','61225','61226','61227','61228','61229','61231','61232','61233','61234','61235','61236','61237','61238','61239','61241','61242','61243','61244','61245','61246','61247','61248','61249','61251','61252','61253','61254','61255','61256','61257','61258','61259','61261','61262','61263','61264','61265','61266','61267','61268','61269','61271','61272','61273','61274','61275','61276','61277','61278','61279','61281','61282','61283','61284','61285','61286','61287','61288','61289'] }
      },
      'Banten': {
        kota: ['Serang','Cilegon','Tangerang','Tangerang Selatan','Lebak','Pandeglang','Serang Kab','Tangerang Kab'],
        pos: { 'Serang':['42111','42112','42113','42114','42115','42116','42117','42118','42119','42121','42122','42123','42124','42125','42126','42127','42128','42129','42131','42132','42133','42134','42135','42136','42137','42138','42139','42141','42142','42143','42144','42145','42146','42147','42148','42149','42151','42152','42153','42154','42155','42156','42157','42158','42159'], 'Cilegon':['42411','42412','42413','42414','42415','42416','42417','42418','42419','42421','42422','42423','42424','42425','42426','42427','42428','42429','42431','42432','42433','42434','42435','42436','42437','42438','42439','42441','42442'], 'Tangerang':['15111','15112','15113','15114','15115','15116','15117','15118','15119','15121','15122','15123','15124','15125','15126','15127','15128','15129','15131','15132','15133','15134','15135','15136','15137','15138','15139','15141','15142','15143','15144','15145','15146','15147','15148','15149','15151','15152','15153','15154','15155','15156','15157','15158','15159','15161','15162','15163','15164','15165','15166','15167','15168','15169','15171','15172','15173','15174','15175'], 'Tangerang Selatan':['15311','15312','15313','15314','15315','15316','15317','15318','15319','15321','15322','15323','15324','15325','15326','15327','15328','15329','15331','15332','15333','15334','15335','15336','15337','15338','15339','15341','15342','15343','15344','15345','15346','15347','15348','15349','15351','15352','15353','15354','15355','15356','15357','15358','15359','15361','15362','15363','15364','15365','15366','15367','15368','15369','15371','15372','15373','15374','15375','15376','15377','15378','15379','15381','15382','15383','15384','15385','15386','15387','15388','15389','15391','15392','15393','15394','15395','15396','15397','15398','15399','15411','15412','15413','15414','15415','15416','15417','15418','15419'] }
      },
      'Bali': {
        kota: ['Denpasar','Badung','Bangli','Buleleng','Gianyar','Jembrana','Karangasem','Klungkung','Tabanan'],
        pos: { 'Denpasar':['80111','80112','80113','80114','80115','80116','80117','80118','80119','80121','80122','80123','80124','80125','80126','80127','80128','80129','80131','80132','80133','80134','80135','80136','80137','80138','80139','80141','80142','80143','80144','80145','80146','80147','80148','80149','80151','80152','80153','80154','80155','80156','80157','80158','80159','80161','80162','80163','80164','80165','80166','80167','80168','80169','80171','80172','80173','80174','80175','80176','80177','80178','80179','80181','80182','80183','80184','80185','80186','80187','80188','80189','80191','80192','80193','80194','80195','80196','80197','80198','80199','80211','80212','80213','80214','80215','80216','80217','80218','80219','80221','80222','80223','80224','80225','80226','80227','80228','80229','80231','80232','80233','80234','80235','80236','80237','80238','80239'], 'Badung':['80351','80352','80353','80354','80355','80356','80357','80358','80359','80361','80362','80363','80364','80365','80366','80367','80368','80369','80371','80372','80373','80374','80375','80376','80377','80378','80379','80381','80382','80383','80384','80385','80386','80387','80388','80389','80391','80392','80393','80394','80395','80396','80397','80398','80399','80431','80432','80433','80434','80435','80436','80437','80438','80439','80441','80442','80443','80444','80445','80446','80447','80448','80449','80451','80452','80453','80454','80455','80456','80457','80458','80459','80461','80462','80463','80464','80465'], 'Gianyar':['80511','80512','80513','80514','80515','80516','80517','80518','80519','80521','80522','80523','80524','80525','80526','80527','80528','80529','80531','80532','80533','80534','80535','80536','80537','80538','80539','80541','80542','80543','80544','80545','80546','80547','80548','80549','80551','80552','80553','80554','80555','80556','80557','80558','80559','80561','80562','80563','80564','80565','80566','80567','80568','80569','80571','80572','80573'], 'Buleleng':['81111','81112','81113','81114','81115','81116','81117','81118','81119','81121','81122','81123','81124','81125','81126','81127','81128','81129','81131','81132','81133','81134','81135','81136','81137','81138','81139','81141','81142','81143','81144','81145','81146','81147','81148','81149','81151','81152','81153','81154','81155','81156','81157','81158','81159'], 'Tabanan':['82111','82112','82113','82114','82115','82116','82117','82118','82119','82121','82122','82123','82124','82125','82126','82127','82128','82129','82131','82132','82133','82134','82135','82136','82137','82138','82139','82141','82142','82143','82144','82145','82146','82147','82148','82149','82151','82152','82153','82154','82155','82156','82157','82158','82159','82161','82162','82163','82164','82165','82166','82167','82168','82169'], 'Karangasem':['80811','80812','80813','80814','80815','80816','80817','80818','80819','80821','80822','80823','80824','80825','80826','80827','80828','80829','80831','80832','80833','80834','80835','80836','80837','80838','80839'], 'Klungkung':['80711','80712','80713','80714','80715','80716','80717','80718','80719','80721','80722','80723','80724','80725','80726','80727','80728','80729','80731','80732','80733','80734','80735','80736','80737','80738','80739'], 'Bangli':['80611','80612','80613','80614','80615','80616','80617','80618','80619','80621','80622','80623','80624','80625','80626','80627','80628','80629','80631','80632','80633','80634','80635','80636','80637','80638','80639'], 'Jembrana':['82211','82212','82213','82214','82215','82216','82217','82218','82219','82221','82222','82223','82224','82225','82226','82227','82228','82229','82231','82232','82233','82234','82235','82236','82237','82238','82239'] }
      },
      'Nusa Tenggara Barat': {
        kota: ['Mataram','Bima','Dompu','Lombok Barat','Lombok Tengah','Lombok Timur','Lombok Utara','Sumbawa','Sumbawa Barat'],
        pos: { 'Mataram':['83111','83112','83113','83114','83115','83116','83117','83118','83119','83121','83122','83123','83124','83125','83126','83127','83128','83129','83131','83132','83133','83134','83135','83136','83137','83138','83139','83141','83142','83143','83144','83145','83146','83147','83148','83149','83151','83152','83153','83154','83155','83156','83157','83158','83159','83161','83162','83163','83164','83165','83166','83167','83168','83169'], 'Bima':['84111','84112','84113','84114','84115','84116','84117','84118','84119','84121','84122','84123','84124','84125','84126','84127','84128','84129','84131','84132','84133','84134','84135','84136','84137','84138','84139','84141','84142','84143','84144','84145','84146','84147','84148','84149','84151'], 'Sumbawa':['84311','84312','84313','84314','84315','84316','84317','84318','84319','84321','84322','84323','84324','84325','84326','84327','84328','84329','84331','84332'] }
      },
      'Nusa Tenggara Timur': {
        kota: ['Kupang','Alor','Belu','Ende','Flores Timur','Kupang Kab','Lembata','Malaka','Manggarai','Manggarai Barat','Manggarai Timur','Nagekeo','Ngada','Rote Ndao','Sabu Raijua','Sikka','Sumba Barat','Sumba Barat Daya','Sumba Tengah','Sumba Timur','Timor Tengah Selatan','Timor Tengah Utara'],
        pos: { 'Kupang':['85111','85112','85113','85114','85115','85116','85117','85118','85119','85121','85122','85123','85124','85125','85126','85127','85128','85129','85131','85132','85133','85134','85135','85136','85137','85138','85139','85141','85142','85143','85144','85145','85146','85147','85148','85149','85151','85152','85153','85154','85155','85156','85157','85158','85159'], 'Ende':['86311','86312','86313','86314','86315','86316','86317','86318','86319','86321','86322','86323','86324','86325'], 'Sikka':['86111','86112','86113','86114','86115','86116','86117','86118','86119','86121'] }
      },
      'Kalimantan Barat': {
        kota: ['Pontianak','Singkawang','Bengkayang','Kapuas Hulu','Kayong Utara','Ketapang','Kubu Raya','Landak','Melawi','Mempawah','Sanggau','Sekadau','Sintang'],
        pos: { 'Pontianak':['78111','78112','78113','78114','78115','78116','78117','78118','78119','78121','78122','78123','78124','78125','78126','78127','78128','78129','78131','78132','78133','78134','78135','78136','78137','78138','78139','78141','78142','78143','78144','78145','78146','78147','78148','78149','78151','78152','78153','78154','78155','78156','78157','78158','78159','78161','78162','78163','78164','78165','78166','78167','78168','78169','78171','78172','78173','78174','78175','78176','78177','78178','78179','78181','78182','78183','78184','78185','78186','78187','78188','78189','78191','78192','78193','78194','78195','78196','78197','78198','78199','78211','78212','78213','78214','78215','78216','78217','78218','78219','78221','78222','78223','78224','78225'], 'Singkawang':['79111','79112','79113','79114','79115','79116','79117','79118','79119','79121','79122','79123','79124','79125','79126','79127','79128','79129','79131','79132','79133','79134','79135','79136','79137','79138','79139','79141','79142','79143','79144','79145'] }
      },
      'Kalimantan Tengah': {
        kota: ['Palangka Raya','Barito Selatan','Barito Timur','Barito Utara','Gunung Mas','Kapuas','Katingan','Kotawaringin Barat','Kotawaringin Timur','Lamandau','Murung Raya','Pulang Pisau','Seruyan','Sukamara'],
        pos: { 'Palangka Raya':['73111','73112','73113','73114','73115','73116','73117','73118','73119','73121','73122','73123','73124','73125','73126','73127','73128','73129','73131','73132','73133','73134','73135','73136','73137','73138','73139','73141','73142','73143','73144','73145','73146','73147','73148','73149','73151','73152','73153','73154','73155','73156','73157','73158','73159','73161','73162','73163','73164','73165','73166','73167','73168','73169','73171','73172','73173','73174','73175','73176','73177','73178','73179','73181','73182','73183','73184','73185','73186','73187','73188','73189','73191','73192','73193','73194','73195','73196','73197','73198','73199','73211','73212','73213','73214','73215','73216','73217','73218','73219','73221','73222','73223','73224','73225','73226','73227','73228','73229','73231','73232','73233','73234','73235','73236','73237','73238','73239'] }
      },
      'Kalimantan Selatan': {
        kota: ['Banjarmasin','Banjarbaru','Balangan','Banjar','Barito Kuala','Hulu Sungai Selatan','Hulu Sungai Tengah','Hulu Sungai Utara','Kotabaru','Tabalong','Tanah Bumbu','Tanah Laut','Tapin'],
        pos: { 'Banjarmasin':['70111','70112','70113','70114','70115','70116','70117','70118','70119','70121','70122','70123','70124','70125','70126','70127','70128','70129','70131','70132','70133','70134','70135','70136','70137','70138','70139','70141','70142','70143','70144','70145','70146','70147','70148','70149','70151','70152','70153','70154','70155','70156','70157','70158','70159','70161','70162','70163','70164','70165','70166','70167','70168','70169','70171','70172','70173','70174','70175','70176','70177','70178','70179','70181','70182','70183','70184','70185','70186','70187','70188','70189','70191','70192','70193','70194','70195','70196','70197','70198','70199','70211','70212','70213','70214','70215','70216','70217','70218','70219','70221','70222','70223','70224','70225','70226','70227','70228','70229','70231','70232','70233','70234','70235','70236','70237','70238','70239'], 'Banjarbaru':['70711','70712','70713','70714','70715','70716','70717','70718','70719','70721','70722','70723','70724','70725','70726','70727','70728','70729','70731','70732','70733','70734','70735','70736','70737','70738','70739','70741','70742','70743','70744','70745','70746','70747','70748','70749','70751','70752','70753','70754','70755','70756','70757','70758','70759','70761','70762','70763','70764','70765','70766','70767','70768','70769'] }
      },
      'Kalimantan Timur': {
        kota: ['Samarinda','Balikpapan','Bontang','Berau','Kutai Barat','Kutai Kartanegara','Kutai Timur','Mahakam Ulu','Paser','Penajam Paser Utara'],
        pos: { 'Samarinda':['75111','75112','75113','75114','75115','75116','75117','75118','75119','75121','75122','75123','75124','75125','75126','75127','75128','75129','75131','75132','75133','75134','75135','75136','75137','75138','75139','75141','75142','75143','75144','75145','75146','75147','75148','75149','75151','75152','75153','75154','75155','75156','75157','75158','75159','75161','75162','75163','75164','75165','75166','75167','75168','75169','75171','75172','75173','75174','75175','75176','75177','75178','75179','75181','75182','75183','75184','75185','75186','75187','75188','75189','75191','75192','75193','75194','75195','75196','75197','75198','75199','75211','75212','75213','75214','75215','75216','75217','75218','75219','75221','75222','75223','75224','75225','75226','75227','75228','75229','75231','75232','75233','75234','75235','75236','75237','75238','75239','75241','75242','75243','75244','75245','75246','75247','75248','75249'], 'Balikpapan':['76111','76112','76113','76114','76115','76116','76117','76118','76119','76121','76122','76123','76124','76125','76126','76127','76128','76129','76131','76132','76133','76134','76135','76136','76137','76138','76139','76141','76142','76143','76144','76145','76146','76147','76148','76149','76151','76152','76153','76154','76155','76156','76157','76158','76159','76161','76162','76163','76164','76165','76166','76167','76168','76169','76171','76172','76173','76174','76175','76176','76177','76178','76179','76181','76182','76183','76184','76185','76186','76187','76188','76189','76191','76192','76193','76194','76195','76196','76197','76198','76199'], 'Bontang':['75311','75312','75313','75314','75315','75316','75317','75318','75319','75321','75322','75323','75324','75325'] }
      },
      'Kalimantan Utara': {
        kota: ['Tarakan','Bulungan','Malinau','Nunukan','Tana Tidung'],
        pos: { 'Tarakan':['77111','77112','77113','77114','77115','77116','77117','77118','77119','77121','77122','77123','77124','77125','77126','77127','77128','77129','77131','77132','77133','77134','77135','77136','77137','77138','77139','77141','77142','77143','77144','77145','77146','77147','77148','77149','77151','77152','77153','77154','77155','77156','77157','77158','77159'], 'Bulungan':['77211','77212','77213','77214','77215','77216','77217','77218','77219','77221','77222','77223','77224','77225'], 'Nunukan':['77411','77412','77413','77414','77415','77416','77417','77418','77419','77421','77422','77423','77424','77425'] }
      },
      'Sulawesi Utara': {
        kota: ['Manado','Bitung','Kotamobagu','Tomohon','Bolmong','Bolmong Selatan','Bolmong Timur','Bolmong Utara','Kepulauan Sangihe','Kepulauan Siau Tagulandang Biaro','Kepulauan Talaud','Minahasa','Minahasa Selatan','Minahasa Tenggara','Minahasa Utara'],
        pos: { 'Manado':['95111','95112','95113','95114','95115','95116','95117','95118','95119','95121','95122','95123','95124','95125','95126','95127','95128','95129','95131','95132','95133','95134','95135','95136','95137','95138','95139','95141','95142','95143','95144','95145','95146','95147','95148','95149','95151','95152','95153','95154','95155','95156','95157','95158','95159','95161','95162','95163','95164','95165','95166','95167','95168','95169','95171','95172','95173','95174','95175','95176','95177','95178','95179','95181','95182','95183','95184','95185','95186','95187','95188','95189','95191','95192','95193','95194','95195','95196','95197','95198','95199','95211','95212','95213','95214','95215','95216','95217','95218','95219','95221','95222','95223','95224','95225','95226','95227','95228','95229','95231','95232','95233','95234','95235','95236','95237','95238','95239','95241','95242','95243','95244','95245','95246','95247','95248','95249','95251','95252','95253','95254','95255','95256','95257','95258','95259','95261','95262','95263','95264','95265','95266','95267','95268','95269','95271','95272','95273','95274','95275'], 'Bitung':['95511','95512','95513','95514','95515','95516','95517','95518','95519','95521','95522','95523','95524','95525','95526','95527','95528','95529','95531','95532','95533','95534','95535','95536','95537','95538','95539','95541','95542','95543','95544','95545','95546','95547','95548','95549'], 'Tomohon':['95411','95412','95413','95414','95415','95416','95417','95418','95419','95421','95422','95423','95424','95425'] }
      },
      'Sulawesi Tengah': {
        kota: ['Palu','Banggai','Banggai Kepulauan','Banggai Laut','Buol','Donggala','Morowali','Morowali Utara','Parigi Moutong','Poso','Sigi','Tojo Una-Una','Tolitoli'],
        pos: { 'Palu':['94111','94112','94113','94114','94115','94116','94117','94118','94119','94121','94122','94123','94124','94125','94126','94127','94128','94129','94131','94132','94133','94134','94135','94136','94137','94138','94139','94141','94142','94143','94144','94145','94146','94147','94148','94149','94151','94152','94153','94154','94155','94156','94157','94158','94159','94161','94162','94163','94164','94165','94166','94167','94168','94169','94171','94172','94173','94174','94175','94176','94177','94178','94179'], 'Donggala':['94311','94312','94313','94314','94315','94316','94317','94318','94319','94321','94322','94323','94324','94325'], 'Poso':['94611','94612','94613','94614','94615','94616','94617','94618','94619','94621','94622','94623','94624','94625'] }
      },
      'Sulawesi Selatan': {
        kota: ['Makassar','Parepare','Palopo','Bantaeng','Barru','Bone','Bulukumba','Enrekang','Gowa','Jeneponto','Kepulauan Selayar','Luwu','Luwu Timur','Luwu Utara','Maros','Pangkajene dan Kepulauan','Pinrang','Sidenreng Rappang','Sinjai','Soppeng','Takalar','Tana Toraja','Toraja Utara','Wajo'],
        pos: { 'Makassar':['90111','90112','90113','90114','90115','90116','90117','90118','90119','90121','90122','90123','90124','90125','90126','90127','90128','90129','90131','90132','90133','90134','90135','90136','90137','90138','90139','90141','90142','90143','90144','90145','90146','90147','90148','90149','90151','90152','90153','90154','90155','90156','90157','90158','90159','90161','90162','90163','90164','90165','90166','90167','90168','90169','90171','90172','90173','90174','90175','90176','90177','90178','90179','90181','90182','90183','90184','90185','90186','90187','90188','90189','90191','90192','90193','90194','90195','90196','90197','90198','90199','90211','90212','90213','90214','90215','90216','90217','90218','90219','90221','90222','90223','90224','90225','90226','90227','90228','90229','90231','90232','90233','90234','90235','90236','90237','90238','90239','90241','90242','90243','90244','90245','90246','90247','90248','90249'], 'Parepare':['91111','91112','91113','91114','91115','91116','91117','91118','91119','91121','91122','91123','91124','91125','91126','91127','91128','91129','91131','91132'], 'Palopo':['91911','91912','91913','91914','91915','91916','91917','91918','91919','91921','91922','91923','91924','91925'] }
      },
      'Sulawesi Tenggara': {
        kota: ['Kendari','Baubau','Bombana','Buton','Buton Selatan','Buton Tengah','Buton Utara','Kolaka','Kolaka Timur','Kolaka Utara','Konawe','Konawe Kepulauan','Konawe Selatan','Konawe Utara','Muna','Muna Barat','Wakatobi'],
        pos: { 'Kendari':['93111','93112','93113','93114','93115','93116','93117','93118','93119','93121','93122','93123','93124','93125','93126','93127','93128','93129','93131','93132','93133','93134','93135','93136','93137','93138','93139','93141','93142','93143','93144','93145','93146','93147','93148','93149','93151','93152','93153','93154','93155','93156','93157','93158','93159','93161','93162','93163','93164','93165','93166','93167','93168','93169','93171','93172','93173','93174','93175'], 'Baubau':['93711','93712','93713','93714','93715','93716','93717','93718','93719','93721','93722','93723','93724','93725'] }
      },
      'Gorontalo': {
        kota: ['Gorontalo','Boalemo','Bone Bolango','Gorontalo Kab','Gorontalo Utara','Pohuwato'],
        pos: { 'Gorontalo':['96111','96112','96113','96114','96115','96116','96117','96118','96119','96121','96122','96123','96124','96125','96126','96127','96128','96129','96131','96132','96133','96134','96135','96136','96137','96138','96139','96141','96142','96143','96144','96145','96146','96147','96148','96149','96151','96152','96153','96154','96155','96156','96157','96158','96159','96161','96162','96163','96164','96165','96166','96167','96168','96169','96171','96172','96173','96174','96175','96176','96177','96178','96179'], 'Pohuwato':['96411','96412','96413','96414','96415','96416','96417','96418','96419','96421','96422','96423','96424','96425'] }
      },
      'Sulawesi Barat': {
        kota: ['Mamuju','Majene','Mamasa','Mamuju Tengah','Mamuju Utara','Polewali Mandar'],
        pos: { 'Mamuju':['91511','91512','91513','91514','91515','91516','91517','91518','91519','91521','91522','91523','91524','91525','91526','91527','91528','91529','91531','91532'], 'Majene':['91411','91412','91413','91414','91415','91416','91417','91418','91419','91421','91422','91423','91424','91425'], 'Polewali Mandar':['91311','91312','91313','91314','91315','91316','91317','91318','91319','91321','91322','91323','91324','91325'] }
      },
      'Maluku': {
        kota: ['Ambon','Tual','Buru','Buru Selatan','Kepulauan Aru','Maluku Barat Daya','Maluku Tengah','Maluku Tenggara','Maluku Tenggara Barat','Seram Bagian Barat','Seram Bagian Timur'],
        pos: { 'Ambon':['97111','97112','97113','97114','97115','97116','97117','97118','97119','97121','97122','97123','97124','97125','97126','97127','97128','97129','97131','97132','97133','97134','97135','97136','97137','97138','97139','97141','97142','97143','97144','97145','97146','97147','97148','97149','97151','97152','97153','97154','97155','97156','97157','97158','97159','97161','97162','97163','97164','97165','97166','97167','97168','97169','97171','97172','97173','97174','97175','97176','97177','97178','97179','97181','97182','97183','97184','97185','97186','97187','97188','97189','97191','97192','97193','97194','97195','97196','97197','97198','97199','97211','97212','97213','97214','97215','97216','97217','97218','97219'], 'Tual':['97611','97612','97613','97614','97615','97616','97617','97618','97619','97621','97622','97623','97624','97625'] }
      },
      'Maluku Utara': {
        kota: ['Ternate','Tidore Kepulauan','Halmahera Barat','Halmahera Tengah','Halmahera Selatan','Halmahera Timur','Halmahera Utara','Kepulauan Sula','Pulau Morotai','Pulau Taliabu'],
        pos: { 'Ternate':['97711','97712','97713','97714','97715','97716','97717','97718','97719','97721','97722','97723','97724','97725','97726','97727','97728','97729','97731','97732','97733','97734','97735','97736','97737','97738','97739','97741','97742','97743','97744','97745','97746','97747','97748','97749','97751','97752','97753','97754','97755','97756','97757','97758','97759','97761','97762','97763','97764','97765','97766','97767','97768','97769','97771','97772','97773','97774','97775'], 'Tidore Kepulauan':['97811','97812','97813','97814','97815','97816','97817','97818','97819','97821','97822','97823','97824','97825'] }
      },
      'Papua': {
        kota: ['Jayapura','Asmat','Biak Numfor','Boven Digoel','Deiyai','Dogiyai','Intan Jaya','Jayapura Kab','Jayawijaya','Keerom','Kepulauan Yapen','Lanny Jaya','Mamberamo Raya','Mamberamo Tengah','Mappi','Memberamo Tengah','Merauke','Mimika','Nabire','Nduga','Paniai','Pegunungan Bintang','Puncak','Puncak Jaya','Sarmi','Supiori','Tolikara','Waropen','Yahukimo','Yalimo'],
        pos: { 'Jayapura':['99111','99112','99113','99114','99115','99116','99117','99118','99119','99121','99122','99123','99124','99125','99126','99127','99128','99129','99131','99132','99133','99134','99135','99136','99137','99138','99139','99141','99142','99143','99144','99145','99146','99147','99148','99149','99151','99152','99153','99154','99155','99156','99157','99158','99159','99161','99162','99163','99164','99165','99166','99167','99168','99169','99171','99172','99173','99174','99175','99176','99177','99178','99179'], 'Merauke':['99611','99612','99613','99614','99615','99616','99617','99618','99619','99621','99622','99623','99624','99625'] }
      },
      'Papua Barat': {
        kota: ['Manokwari','Fakfak','Kaimana','Manokwari Selatan','Maybrat','Pegunungan Arfak','Raja Ampat','Sorong','Sorong Selatan','Tambrauw','Teluk Bintuni','Teluk Wondama'],
        pos: { 'Manokwari':['98311','98312','98313','98314','98315','98316','98317','98318','98319','98321','98322','98323','98324','98325','98326','98327','98328','98329','98331','98332','98333','98334','98335','98336','98337','98338','98339','98341','98342','98343','98344','98345','98346','98347','98348','98349','98351','98352','98353','98354','98355'], 'Sorong':['98411','98412','98413','98414','98415','98416','98417','98418','98419','98421','98422','98423','98424','98425','98426','98427','98428','98429','98431','98432','98433','98434','98435'], 'Fakfak':['98651','98652','98653','98654','98655','98656','98657','98658','98659','98661','98662','98663','98664','98665'] }
      },
      'Papua Selatan': {
        kota: ['Merauke','Asmat','Boven Digoel','Mappi'],
        pos: { 'Merauke':['99611','99612','99613','99614','99615','99616','99617','99618','99619','99621','99622','99623','99624','99625'], 'Asmat':['99761','99762','99763','99764','99765'], 'Boven Digoel':['99661','99662','99663','99664','99665'], 'Mappi':['99711','99712','99713','99714','99715'] }
      },
      'Papua Tengah': {
        kota: ['Nabire','Deiyai','Dogiyai','Intan Jaya','Mimika','Paniai','Puncak','Puncak Jaya'],
        pos: { 'Nabire':['98811','98812','98813','98814','98815','98816','98817','98818','98819','98821','98822','98823','98824','98825'], 'Mimika':['98671','98672','98673','98674','98675','98676','98677','98678','98679','98681','98682','98683','98684','98685'] }
      },
      'Papua Pegunungan': {
        kota: ['Jayawijaya','Lanny Jaya','Mamberamo Tengah','Nduga','Pegunungan Bintang','Tolikara','Yahukimo','Yalimo'],
        pos: { 'Jayawijaya':['99511','99512','99513','99514','99515','99516','99517','99518','99519','99521','99522','99523','99524','99525'], 'Tolikara':['99461','99462','99463','99464','99465'], 'Yahukimo':['99411','99412','99413','99414','99415'] }
      }
    };

    function initProvinsiSelect() {
        const sel = document.getElementById('sekolahProvinsi');
        if (!sel) return;
        const saved = infoSekolah.provinsi || '';
        Object.keys(INDO_WILAYAH).sort().forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov; opt.textContent = prov;
            if (prov === saved) opt.selected = true;
            sel.appendChild(opt);
        });
        if (saved) { onProvinsiChange(true); }
    }

    function onProvinsiChange(restoring=false) {
        const prov = document.getElementById('sekolahProvinsi').value;
        const kotaSel = document.getElementById('sekolahKodePOS');
        const kotaEl = document.getElementById('sekolahKota');
        kotaEl.innerHTML = '<option value="">— Pilih Kota/Kabupaten —</option>';
        kotaEl.disabled = !prov;
        if (kotaSel) { kotaSel.innerHTML = '<option value="">— Pilih Kota/Kabupaten terlebih dahulu —</option>'; kotaSel.disabled = true; }
        if (!prov) return;
        const data = INDO_WILAYAH[prov];
        if (!data) return;
        const savedKota = infoSekolah.kota || '';
        data.kota.sort().forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = k;
            if (k === savedKota) opt.selected = true;
            kotaEl.appendChild(opt);
        });
        if (savedKota && restoring) { onKotaChange(true); }
    }

    function onKotaChange(restoring=false) {
        const prov = document.getElementById('sekolahProvinsi').value;
        const kota = document.getElementById('sekolahKota').value;
        const posSel = document.getElementById('sekolahKodePOS');
        if (!posSel) return;
        posSel.innerHTML = '<option value="">— Pilih Kode POS —</option>';
        posSel.disabled = !kota;
        if (!kota || !prov) return;
        const data = INDO_WILAYAH[prov];
        if (!data) return;
        const posArr = data.pos[kota] || [];
        const savedPos = infoSekolah.kodePos || '';
        posArr.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            if (p === savedPos) opt.selected = true;
            posSel.appendChild(opt);
        });
    }

    /* ======================================================
       CASCADE COMBOBOX PATCH: hook into loadInfoSekolahForm
    ====================================================== */

        /* ======================================================
       LOGO SEKOLAH UPLOAD
    ====================================================== */
    function handleLogoUpload(input) {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Ukuran logo maksimal 2MB!', 'error'); input.value=''; return; }
        if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar!', 'error'); input.value=''; return; }
        const reader = new FileReader();
        reader.onload = function(e) {
            const src = e.target.result;
            infoSekolah.logo = src;
            simpanState();
            const img = document.getElementById('logoPreviewImg');
            const txt = document.getElementById('logoPreviewText');
            const btn = document.getElementById('logoHapusBtn');
            if(img){ img.src = src; img.style.display = 'block'; }
            if(txt) txt.style.display = 'none';
            if(btn) btn.style.display = 'inline-block';
            renderSekolahPreview();
            showToast('Logo sekolah berhasil diunggah!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function hapusLogo() {
        infoSekolah.logo = '';
        simpanState();
        const img = document.getElementById('logoPreviewImg');
        const txt = document.getElementById('logoPreviewText');
        const btn = document.getElementById('logoHapusBtn');
        const inp = document.getElementById('logoUploadInput');
        if(img){ img.src=''; img.style.display='none'; }
        if(txt) txt.style.display = 'block';
        if(btn) btn.style.display = 'none';
        if(inp) inp.value = '';
        renderSekolahPreview();
        showToast('Logo sekolah dihapus.', 'warning');
    }

    /* ======================================================
       TOAST
    ====================================================== */
    function showToast(msg, type='success') {
        const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<span class="toast-icon">${icons[type]||'✓'}</span> ${msg}`;
        const existing = document.querySelectorAll('.toast.show');
        t.style.bottom = (28+existing.length*70)+'px';
        document.body.appendChild(t);
        setTimeout(()=>t.classList.add('show'),100);
        setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),500); },3500);
    }

    /* ======================================================
       ANALISIS CEPAT
    ====================================================== */
    const inputContainer = document.getElementById('nilaiInputs');
    const jumlahInput    = document.getElementById('jumlahNilai');
    function generateFields() {
        inputContainer.innerHTML='';
        const count = Math.min(Math.max(parseInt(jumlahInput.value)||1,1),25);
        for (let i=0;i<count;i++) {
            const wrap=document.createElement('div');
            const lbl=document.createElement('p'); lbl.className='label-sm'; lbl.textContent=`Mapel ${i+1}`;
            const inp=document.createElement('input'); inp.type='number'; inp.placeholder='0–100'; inp.className='nilai-field'; inp.id=`n-${i}`;
            inp.min=0; inp.max=100;
            wrap.appendChild(lbl); wrap.appendChild(inp); inputContainer.appendChild(wrap);
        }
    }
    jumlahInput.addEventListener('input',generateFields);
    window.addEventListener('load',generateFields);

    /* ======================================================
       PREDIKAT
    ====================================================== */
    function hitungPredikat(nilai) {
        if (nilai>=90) return 'A';
        if (nilai>=80) return 'B';
        if (nilai>=70) return 'C';
        if (nilai>=60) return 'D';
        if (nilai>=50) return 'E';
        return 'F';
    }

    function resetInformationSchool() {
        infoSekolah = { nama:'', npsn:'', alamat:'', kota:'', provinsi:'',
                        kodePos:'', telepon:'', email:'', website:'',
                        kepsek:'', nipKepsek:'', tahunPelajaran:'', semester:'', logo:'' };
        simpanState();
        loadInfoSekolahForm();
        document.getElementById('sekolahPreviewCard').style.display='none';
        showToast('Informasi sekolah berhasil direset!', 'success');
    }
    
    /* ======================================================
       ANALISIS & SIMPAN SISWA
    ====================================================== */
    function processAnalysis() {
        const nama    = document.getElementById('nama').value.trim();
        const nisVal  = document.getElementById('nisManual').value.trim();
        const nisnVal = document.getElementById('nisnManual').value.trim();
        const kelasVal= document.getElementById('kelasManual').value;
        const waliVal = document.getElementById('waliKelas').value.trim();
        const hadir   = document.getElementById('hadirSiswa').value.trim();
        const sakit   = document.getElementById('sakitSiswa').value.trim();
        const izin    = document.getElementById('izinSiswa').value.trim();
        const alpha   = document.getElementById('alphaSiswa').value.trim();
        const catatan = document.getElementById('catatanSiswa').value.trim();
        const inputs  = document.querySelectorAll('.nilai-field');
        let total=0, valid=true, count=0;

        if (!nama) { showToast('Masukkan Nama Siswa terlebih dahulu!','error'); return; }
        if (/\d/.test(nama)) { showToast('Nama Siswa tidak boleh mengandung angka!','error'); document.getElementById('nama').classList.add('input-error'); return; }
        if (!nisVal) { showToast('Masukkan NIS Siswa terlebih dahulu!','error'); return; }
        if (/\D/.test(nisVal)) { showToast('NIS hanya boleh berisi angka!','error'); document.getElementById('nisManual').classList.add('input-error'); return; }
        if (nisnVal && (/\D/.test(nisnVal)||nisnVal.length!==10)) { showToast('NISN harus 10 digit angka!','error'); document.getElementById('nisnManual').classList.add('input-error'); return; }
        if (!kelasVal) { showToast('Pilih Kelas terlebih dahulu!','error'); return; }
        if (waliVal && /\d/.test(waliVal)) { showToast('Nama Wali Kelas tidak boleh mengandung angka!','error'); return; }
        if (hadir && /\D/.test(hadir)) { showToast('Kehadiran (Hadir) harus angka!','error'); return; }
        if (sakit && /\D/.test(sakit)) { showToast('Kehadiran (Sakit) harus angka!','error'); return; }
        if (izin  && /\D/.test(izin))  { showToast('Kehadiran (Izin) harus angka!','error'); return; }
        if (alpha && /\D/.test(alpha)) { showToast('Kehadiran (Alpha) harus angka!','error'); return; }

        inputs.forEach(inp => {
            const v = parseFloat(inp.value);
            if (isNaN(v)||v<0||v>100) { valid=false; inp.classList.add('input-error'); }
            else { inp.classList.remove('input-error'); total+=v; count++; }
        });
        if (!valid||count===0) { showToast('Semua nilai harus antara 0 – 100!','error'); return; }

        const rata  = total/count;
        const grade = hitungPredikat(rata);
        const status= rata>=75?'LULUS':'TIDAK LULUS';

        const resultDiv = document.getElementById('results');
        resultDiv.style.display='block';
        const bar=document.getElementById('bar'); bar.style.width='0%';
        setTimeout(()=>{bar.style.width=rata+'%';},100);

        const statusTag=document.getElementById('statusTag');
        statusTag.innerText=`STATUS SISWA: ${status}`;
        statusTag.style.background=status==='LULUS'?'rgba(0,242,255,0.1)':'rgba(239,68,68,0.1)';
        statusTag.style.color=status==='LULUS'?'var(--accent)':'#ff4444';
        statusTag.style.borderColor=status==='LULUS'?'var(--accent)':'#ff4444';

        document.getElementById('resultContent').innerHTML=`
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NAMA SISWA</span><span class="val" style="font-size:1.05rem;color:var(--accent)">${nama.toUpperCase()}</span></div>
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NIS</span><span class="val" style="font-size:1.1rem;">${nisVal}</span></div>
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">KELAS</span><span class="val" style="font-size:1.1rem;">${kelasVal}</span></div>
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">RATA-RATA</span><span class="val">${rata.toFixed(1)}</span></div>
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">PREDIKAT</span><span class="val" style="color:var(--accent-purple)">${grade}</span></div>
            <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">JUMLAH MAPEL</span><span class="val" style="font-size:1.2rem;">${count}</span></div>`;

        if (status==='LULUS') confetti({particleCount:150,spread:70,origin:{y:0.6},colors:['#00f2ff','#7000ff','#ffffff']});
        resultDiv.scrollIntoView({behavior:'smooth'});

        const kehadiran = { hadir:hadir||'0', sakit:sakit||'0', izin:izin||'0', alpha:alpha||'0' };

        if (editingSiswaId) {
            const idx=daftarSiswa.findIndex(s=>s.id===editingSiswaId);
            if (idx>-1) {
                if (nisVal) {
                    const dupNIS=daftarSiswa.find(s=>s.nis===nisVal&&s.id!==editingSiswaId);
                    if (dupNIS) { showToast(`NIS "${nisVal}" sudah digunakan siswa lain!`,'error'); return; }
                }
                const oldNis = daftarSiswa[idx].nis;
                const newNis = nisVal || oldNis;
                // Update siswaId di daftarNilai jika NIS berubah
                if (newNis !== oldNis) {
                    daftarNilai = daftarNilai.map(n => n.siswaId === editingSiswaId ? {...n, siswaId: newNis} : n);
                }
                daftarSiswa[idx]={...daftarSiswa[idx],id:newNis,nama:nama.toUpperCase(),nis:newNis,nisn:nisnVal||daftarSiswa[idx].nisn||'',kelas:kelasVal||daftarSiswa[idx].kelas,waliKelas:waliVal,kehadiran,catatan};
                simpanState(); renderSiswaTable(); renderLeger(); renderNilaiTable();
                showToast(`Data siswa "${nama.toUpperCase()}" berhasil diperbarui!`,'success');
                setTimeout(()=>{document.getElementById('results').style.display='none';},5000);
            }
            editingSiswaId=null;
            document.getElementById('siswaBanner').classList.remove('show');
            document.getElementById('btnSiswaSubmit').textContent='Analisis & Simpan Data Siswa';
            _resetSiswaForm();
        } else {
            _hookSimpanSiswa(nama, nisVal, nisnVal, kelasVal, waliVal, kehadiran, catatan);
        }
    }

    function _resetSiswaForm() {
        ['nama','nisManual','nisnManual','waliKelas','hadirSiswa','sakitSiswa','izinSiswa','alphaSiswa','catatanSiswa'].forEach(id=>{
            const el=document.getElementById(id); if(el){el.value='';el.classList.remove('input-error','input-ok');}
        });
        document.getElementById('kelasManual').value='';
        document.querySelectorAll('.nilai-field').forEach(inp=>{inp.value='';inp.classList.remove('input-error');});
    }

    function _hookSimpanSiswa(nama, nisVal, nisnVal, kelasVal, waliVal, kehadiran, catatan) {
        if (!nama) return;
        if (nisVal) {
            const dupNIS=daftarSiswa.find(s=>s.nis===nisVal);
            if (dupNIS) { showToast(`NIS "${nisVal}" sudah digunakan oleh ${dupNIS.nama}!`,'error'); return; }
        }
        const sudahAda=daftarSiswa.find(s=>s.nama.toLowerCase()===nama.toLowerCase()&&s.kelas===kelasVal);
        if (sudahAda) { showToast(`Siswa "${nama.toUpperCase()}" sudah terdaftar di kelas ${kelasVal}!`,'warning'); return; }
        const nis  = nisVal||'S'+Date.now().toString().slice(-6);
        const kelas= kelasVal||'—';
        daftarSiswa.push({id:nis,nis,nisn:nisnVal||'',nama:nama.toUpperCase(),kelas,waliKelas:waliVal,kehadiran,catatan,_ts:Date.now()});
        simpanState(); renderSiswaTable();
        showToast(`Siswa "${nama.toUpperCase()}" berhasil ditambahkan!`,'success');
        _resetSiswaForm();
        setTimeout(()=>{document.getElementById('results').style.display='none';},5000);
    }

    function editSiswa(id) {
        const s=daftarSiswa.find(x=>x.id===id); if(!s) return;
        editingSiswaId=id;
        document.getElementById('nama').value=s.nama;
        document.getElementById('nisManual').value=s.nis;
        document.getElementById('nisnManual').value=s.nisn||'';
        document.getElementById('kelasManual').value=s.kelas||'';
        document.getElementById('waliKelas').value=s.waliKelas||'';
        if (s.kehadiran) {
            document.getElementById('hadirSiswa').value=s.kehadiran.hadir||'';
            document.getElementById('sakitSiswa').value=s.kehadiran.sakit||'';
            document.getElementById('izinSiswa').value=s.kehadiran.izin||'';
            document.getElementById('alphaSiswa').value=s.kehadiran.alpha||'';
        }
        document.getElementById('catatanSiswa').value=s.catatan||'';
        document.getElementById('siswaBannerNama').textContent=s.nama;
        document.getElementById('siswaBanner').classList.add('show');
        document.getElementById('btnSiswaSubmit').textContent='Update Data Siswa';
        switchTab('tab-siswa');
        document.getElementById('nama').scrollIntoView({behavior:'smooth'});
        showToast(`Mode edit: ${s.nama}`,'info');
    }

    function batalEditSiswa() {
        editingSiswaId=null;
        document.getElementById('siswaBanner').classList.remove('show');
        document.getElementById('btnSiswaSubmit').textContent='Analisis & Simpan Data Siswa';
        _resetSiswaForm();
        showToast('Edit siswa dibatalkan.','warning');
    }

    function hapusSiswa(id) {
        const s=daftarSiswa.find(x=>x.id===id);
        const jN=daftarNilai.filter(n=>n.siswaId===id).length;
        const wN=jN>0?` (termasuk ${jN} data nilai)`:'';
        if (!confirm(`Hapus siswa "${s?s.nama:''}"${wN}? Tidak dapat dibatalkan.`)) return;
        daftarSiswa=daftarSiswa.filter(x=>x.id!==id);
        daftarNilai=daftarNilai.filter(n=>n.siswaId!==id);
        simpanState(); renderLeger(); renderSiswaTable(); renderNilaiTable();
        showToast(`Data siswa "${s?s.nama:''}" berhasil dihapus.`,'success');
    }

    /* ======================================================
       RENDER TABEL SISWA
    ====================================================== */
    function renderSiswaTable() {
        const tbody=document.getElementById('siswaTableBody'); if(!tbody) return;
        const q=(document.getElementById('siswaSearchInput')?.value||'').toLowerCase().trim();
        const fKelas=document.getElementById('siswaFilterKelas')?.value||'';
        const sortVal=document.getElementById('siswaSort')?.value||'nis-az';
        const perPage=parseInt(document.getElementById('siswaEntriesPerPage')?.value||10);

        let filtered=daftarSiswa.filter(s=>{
            const matchQ=!q||s.nama.toLowerCase().includes(q)||s.nis.toLowerCase().includes(q)||(s.kelas||'').toLowerCase().includes(q)||(s.nisn||'').includes(q);
            const matchK=!fKelas||s.kelas===fKelas;
            return matchQ&&matchK;
        });
        filtered.sort((a,b)=>{
            if(sortVal==='nama-az') return a.nama.localeCompare(b.nama);
            if(sortVal==='nama-za') return b.nama.localeCompare(a.nama);
            if(sortVal==='nis-az') return a.nis.localeCompare(b.nis,undefined,{numeric:true});
            if(sortVal==='nis-za') return b.nis.localeCompare(a.nis,undefined,{numeric:true});
            if(sortVal==='kelas-az') return (a.kelas||'').localeCompare(b.kelas||'',undefined,{numeric:true});
            if(sortVal==='kelas-za') return (b.kelas||'').localeCompare(a.kelas||'',undefined,{numeric:true});
            if(sortVal==='terbaru') return (b._ts||0)-(a._ts||0);
            if(sortVal==='terlama') return (a._ts||0)-(b._ts||0);
            return 0;
        });

        const total=daftarSiswa.length, filteredN=filtered.length;
        const totalPages=Math.max(1,Math.ceil(filteredN/perPage));
        if(siswaPage>totalPages) siswaPage=totalPages;
        const start=(siswaPage-1)*perPage, end=Math.min(start+perPage,filteredN);
        const page=filtered.slice(start,end);

        if(filteredN===0) {
            tbody.innerHTML=`<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/16769/16769643.png" width="50px"/></div><div class="empty-state-text">${total===0?'Belum ada data siswa':'Tidak ada data yang cocok'}</div></div></td></tr>`;
            buildShowingInfo('siswaShowingInfo',0,0,total,0);
            buildPagination('siswaPagination',siswaPage,0,'setSiswaPage'); return;
        }
        tbody.innerHTML=page.map((s,i)=>`
            <tr>
                <td style="color:var(--text-muted);font-size:0.78rem;">${start+i+1}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.82rem;">${s.nisn||'—'}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.82rem;">${s.nis}</td>
                <td style="font-weight:600;">${s.nama}</td>
                <td style="color:var(--text-muted);font-size:0.82rem;">${s.kelas||'—'}</td>
                <td style="color:var(--text-muted);font-size:0.78rem;">${s.waliKelas||'—'}</td>
                <td style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="btn-action btn-edit" onclick="editSiswa('${s.id}')">✏ Edit</button>
                    <button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button>
                </td>
            </tr>`).join('');
        buildShowingInfo('siswaShowingInfo',start+1,end,total,filteredN);
        buildPagination('siswaPagination',siswaPage,totalPages,'setSiswaPage');
    }

    /* ======================================================
       MAPEL: TAMBAH / EDIT
    ====================================================== */
    function tambahMapel() {
        const nama  = document.getElementById('namaMapel').value.trim();
        const guru  = document.getElementById('namaGuru').value.trim();
        const nip   = document.getElementById('nipGuru').value.trim();
        const kelas = document.getElementById('kelasMapel').value;
        const kkmRaw= parseInt(document.getElementById('kkm').value);

        if (!nama) { showToast('Nama Mata Pelajaran wajib diisi!','error'); return; }
        if (!guru) { showToast('Nama Guru Pengampu wajib diisi!','error'); return; }
        if (/\d/.test(guru)) { showToast('Nama Guru tidak boleh mengandung angka!','error'); document.getElementById('namaGuru').classList.add('input-error'); return; }
        if (!nip)  { showToast('NIP Guru wajib diisi!','error'); return; }
        if (/\D/.test(nip)) { showToast('NIP hanya boleh berisi angka!','error'); document.getElementById('nipGuru').classList.add('input-error'); return; }
        if (isNaN(kkmRaw)||kkmRaw<1||kkmRaw>100) {
            showToast('KKM harus berupa angka antara 1 – 100!','error');
            document.getElementById('kkm').classList.add('input-error'); return;
        }
        document.getElementById('kkm').classList.remove('input-error');
        const kkm=kkmRaw;

        if (editingMapelId) {
            const idx=daftarMapel.findIndex(m=>m.id===editingMapelId);
            if (idx>-1) {
                const dupNIP=daftarMapel.find(m=>m.nip===nip&&m.id!==editingMapelId);
                if (dupNIP) { showToast(`NIP "${nip}" sudah digunakan guru mapel "${dupNIP.nama}"!`,'error'); return; }
                daftarMapel[idx]={...daftarMapel[idx],nama,guru,nip,kelas,kkm};
                simpanState(); renderMapelList(); refreshAllSelects();
                showToast(`Mapel "${nama}" berhasil diperbarui!`,'success');
            }
            editingMapelId=null;
            document.getElementById('mapelBanner').classList.remove('show');
            document.getElementById('btnMapelSubmit').textContent='Simpan Mata Pelajaran & Guru';
            _resetMapelForm(); return;
        }

        const dupNIP=daftarMapel.find(m=>m.nip===nip);
        if (dupNIP) { showToast(`NIP "${nip}" sudah digunakan guru mapel "${dupNIP.nama}"!`,'error'); return; }
        const sudahAda=daftarMapel.find(m=>m.nama.toLowerCase()===nama.toLowerCase()&&m.kelas===kelas);
        if (sudahAda) { showToast('Mata Pelajaran ini sudah ada untuk kelas tersebut!','warning'); return; }

        daftarMapel.push({id:'MP'+Date.now(),nama,guru,nip,kelas,kkm,_ts:Date.now()});
        simpanState(); renderMapelList(); refreshAllSelects();
        _resetMapelForm();
        showToast(`Mapel "${nama}" berhasil disimpan!`,'success');
    }

    function _resetMapelForm() {
        ['namaMapel','namaGuru','nipGuru','kkm'].forEach(id=>{
            const el=document.getElementById(id); if(el){el.value='';el.classList.remove('input-error','input-ok');}
        });
        document.getElementById('kelasMapel').value='';
    }

    function editMapel(id) {
        const m=daftarMapel.find(x=>x.id===id); if(!m) return;
        editingMapelId=id;
        document.getElementById('namaMapel').value=m.nama;
        document.getElementById('namaGuru').value=m.guru;
        document.getElementById('nipGuru').value=m.nip||'';
        document.getElementById('kelasMapel').value=m.kelas||'';
        document.getElementById('kkm').value=m.kkm;
        document.getElementById('mapelBannerNama').textContent=m.nama;
        document.getElementById('mapelBanner').classList.add('show');
        document.getElementById('btnMapelSubmit').textContent='Update Mata Pelajaran & Guru';
        switchTab('tab-mapel');
        document.getElementById('namaMapel').scrollIntoView({behavior:'smooth'});
        showToast(`Mode edit mapel: ${m.nama}`,'info');
    }

    function batalEditMapel() {
        editingMapelId=null;
        document.getElementById('mapelBanner').classList.remove('show');
        document.getElementById('btnMapelSubmit').textContent='Simpan Mata Pelajaran & Guru';
        _resetMapelForm();
        showToast('Edit mapel dibatalkan.','warning');
    }

    function hapusMapel(id) {
        const m=daftarMapel.find(x=>x.id===id);
        const jN=daftarNilai.filter(n=>n.mapelId===id).length;
        const wN=jN>0?` (${jN} data nilai terkait tidak ikut terhapus)`:'';
        if (!confirm(`Hapus mapel "${m?m.nama:''}"${wN}?`)) return;
        daftarMapel=daftarMapel.filter(x=>x.id!==id);
        simpanState(); renderMapelList(); refreshAllSelects();
        showToast(`Mapel "${m?m.nama:''}" berhasil dihapus.`,'success');
    }

    function renderMapelList() {
        const el=document.getElementById('mapelList'); if(!el) return;
        const q=(document.getElementById('mapelSearchInput')?.value||'').toLowerCase().trim();
        const fKelas=document.getElementById('mapelFilterKelas')?.value||'';
        const sortVal=document.getElementById('mapelSort')?.value||'nama-az';
        const perPage=parseInt(document.getElementById('mapelEntriesPerPage')?.value||10);

        let filtered=daftarMapel.filter(m=>{
            const matchQ=!q||m.nama.toLowerCase().includes(q)||m.guru.toLowerCase().includes(q)||(m.nip||'').toLowerCase().includes(q)||(m.kelas||'').toLowerCase().includes(q);
            const matchK=!fKelas||m.kelas===fKelas;
            return matchQ&&matchK;
        });
        filtered.sort((a,b)=>{
            if(sortVal==='nip-az') return (a.nip||'').localeCompare(b.nip||'',undefined,{numeric:true});
            if(sortVal==='nip-za') return (b.nip||'').localeCompare(a.nip||'',undefined,{numeric:true});
            if(sortVal==='nama-az') return a.nama.localeCompare(b.nama);
            if(sortVal==='nama-za') return b.nama.localeCompare(a.nama);
            if(sortVal==='guru-az') return a.guru.localeCompare(b.guru);
            if(sortVal==='guru-za') return b.guru.localeCompare(a.guru);
            if(sortVal==='kelas-az') return (a.kelas||'').localeCompare(b.kelas||'',undefined,{numeric:true});
            if(sortVal==='kelas-za') return (b.kelas||'').localeCompare(a.kelas||'',undefined,{numeric:true});
            if(sortVal==='kkm-tinggi') return b.kkm-a.kkm;
            if(sortVal==='kkm-rendah') return a.kkm-b.kkm;
            if(sortVal==='terbaru') return (b._ts||0)-(a._ts||0);
            if(sortVal==='terlama') return (a._ts||0)-(b._ts||0);
            return 0;
        });

        const total=daftarMapel.length, filteredN=filtered.length;
        const totalPages=Math.max(1,Math.ceil(filteredN/perPage));
        if(mapelPage>totalPages) mapelPage=totalPages;
        const start=(mapelPage-1)*perPage, end=Math.min(start+perPage,filteredN);
        const page=filtered.slice(start,end);

        if(filteredN===0) {
            el.innerHTML=`<div class="empty-state" style="padding:30px;"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/9585/9585435.png" width="50px"/></div><div class="empty-state-text">${total===0?'Belum ada mata pelajaran':'Tidak ada data yang cocok'}</div></div>`;
            buildShowingInfo('mapelShowingInfo',0,0,total,0);
            buildPagination('mapelPagination',mapelPage,0,'setMapelPage'); return;
        }
        el.innerHTML=page.map((m,i)=>`
            <div class="mapel-card">
                <div class="mapel-num">${String(start+i+1).padStart(2,'0')}</div>
                <div class="mapel-info">
                    <div class="mapel-nama">${m.nama}</div>
                    <div class="mapel-detail">
                        ${m.nip?`<span class="mapel-nip">NIP: ${m.nip}</span><span class="mapel-detail-sep">•</span>`:''}
                        <span>${m.guru}</span>
                        <span class="mapel-detail-sep">•</span>
                        <span>${m.kelas||'—'}</span>
                        <span class="mapel-detail-sep">•</span>
                        <span class="mapel-kkm">KKM ${m.kkm}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button class="btn-action btn-edit" onclick="editMapel('${m.id}')">✏ Edit</button>
                    <button class="btn-action" onclick="hapusMapel('${m.id}')">Hapus</button>
                </div>
            </div>`).join('');
        buildShowingInfo('mapelShowingInfo',start+1,end,total,filteredN);
        buildPagination('mapelPagination',mapelPage,totalPages,'setMapelPage');
    }

    /* ======================================================
       REFRESH SELECTS
    ====================================================== */
    function refreshAllSelects() { refreshSelectSiswa(); refreshSelectMapelOnly(); refreshExportSiswaSelect(); }
    function refreshSelectSiswa() {
        const sel=document.getElementById('nilaiSiswaSelect'); if(!sel) return;
        const prev=sel.value;
        sel.innerHTML='<option value="">— Pilih Siswa —</option>'+
            daftarSiswa.map(s=>`<option value="${s.id}">(${s.nis}) ${s.nama} — ${s.kelas||'—'}</option>`).join('');
        if(prev) sel.value=prev;
    }
    function refreshSelectMapelOnly() {
        const sel=document.getElementById('nilaiMapelSelect'); if(!sel) return;
        const prev=sel.value;
        sel.innerHTML='<option value="">— Pilih Mata Pelajaran —</option>'+
            daftarMapel.map(m=>`<option value="${m.id}">${m.nama}${m.guru?' · '+m.guru:''}${m.kelas?' · '+m.kelas:''}</option>`).join('');
        if(prev) sel.value=prev;
    }
    function refreshExportSiswaSelect() {
        const s=document.getElementById('exportSiswaSelect'); if(!s) return;
        s.innerHTML='<option value="">— Pilih Siswa —</option>'+
            daftarSiswa.map(x=>`<option value="${x.id}">(${x.nis}) ${x.nama} — ${x.kelas||'—'}</option>`).join('');
    }

    /* ======================================================
       PREVIEW & SIMPAN NILAI
    ====================================================== */
    function previewNilai() {
        const t=parseFloat(document.getElementById('nilaiTugas')?.value);
        const u=parseFloat(document.getElementById('nilaiUTS')?.value);
        const a=parseFloat(document.getElementById('nilaiUAS')?.value);
        const preview=document.getElementById('previewNilaiAkhir');
        const allEmpty=document.getElementById('nilaiTugas')?.value===''&&document.getElementById('nilaiUTS')?.value===''&&document.getElementById('nilaiUAS')?.value==='';
        if(allEmpty) { if(preview) preview.style.display='none'; return; }
        if(preview) preview.style.display='block';
        const akhir=((isNaN(t)?0:t)*0.3)+((isNaN(u)?0:u)*0.3)+((isNaN(a)?0:a)*0.4);
        const predikat=hitungPredikat(akhir);
        const mapelId=document.getElementById('nilaiMapelSelect')?.value;
        const mapel=daftarMapel.find(m=>m.id===mapelId);
        const kkm=mapel?mapel.kkm:75;
        const lulus=akhir>=kkm;
        const el=document.getElementById('prevNilaiAkhir');
        const ep=document.getElementById('prevPredikat');
        const ek=document.getElementById('prevKKM');
        const ekv=document.getElementById('prevKKMVal');
        if(el){el.textContent=akhir.toFixed(1);el.style.color=lulus?'var(--accent)':'#f87171';}
        if(ep) ep.textContent=predikat;
        if(ek){ek.textContent=lulus?'✓ LULUS KKM':'✗ BELUM KKM';ek.style.color=lulus?'#4ade80':'#f87171';}
        if(ekv){ekv.textContent=`KKM: ${kkm}${mapel?'':' (default)'}`;}
    }

    function simpanNilai() {
        const siswaId=document.getElementById('nilaiSiswaSelect')?.value;
        const mapelId=document.getElementById('nilaiMapelSelect')?.value;
        const tVal=document.getElementById('nilaiTugas')?.value;
        const uVal=document.getElementById('nilaiUTS')?.value;
        const aVal=document.getElementById('nilaiUAS')?.value;
        const t=parseFloat(tVal), u=parseFloat(uVal), a=parseFloat(aVal);

        if(!siswaId){ showToast('Pilih Siswa terlebih dahulu!','error'); return; }
        if(!mapelId){ showToast('Pilih Mata Pelajaran terlebih dahulu!','error'); return; }
        if(tVal===''||isNaN(t)||t<0||t>100){ showToast('Nilai Tugas tidak valid! Harus 0–100','error'); document.getElementById('nilaiTugas').classList.add('input-error'); return; }
        else document.getElementById('nilaiTugas').classList.remove('input-error');
        if(uVal===''||isNaN(u)||u<0||u>100){ showToast('Nilai UTS tidak valid! Harus 0–100','error'); document.getElementById('nilaiUTS').classList.add('input-error'); return; }
        else document.getElementById('nilaiUTS').classList.remove('input-error');
        if(aVal===''||isNaN(a)||a<0||a>100){ showToast('Nilai UAS tidak valid! Harus 0–100','error'); document.getElementById('nilaiUAS').classList.add('input-error'); return; }
        else document.getElementById('nilaiUAS').classList.remove('input-error');

        const akhir=(t*0.3)+(u*0.3)+(a*0.4);
        const predikat=hitungPredikat(akhir);
        const isUpdate=daftarNilai.some(n=>n.siswaId===siswaId&&n.mapelId===mapelId);
        daftarNilai=daftarNilai.filter(n=>!(n.siswaId===siswaId&&n.mapelId===mapelId));
        daftarNilai.push({id:'N'+Date.now(),siswaId,mapelId,tugas:t,uts:u,uas:a,akhir:parseFloat(akhir.toFixed(2)),predikat,_ts:Date.now()});
        simpanState(); renderNilaiTable(); renderLeger();

        ['nilaiTugas','nilaiUTS','nilaiUAS'].forEach(id=>{document.getElementById(id).value='';document.getElementById(id).classList.remove('input-error');});
        document.getElementById('nilaiSiswaSelect').value='';
        document.getElementById('nilaiMapelSelect').value='';
        setTimeout(()=>{document.getElementById('previewNilaiAkhir').style.display='none';},5000);

        const siswa=daftarSiswa.find(s=>s.id===siswaId);
        const mapel=daftarMapel.find(m=>m.id===mapelId);
        showToast(`Nilai "${mapel?mapel.nama:''}" ${isUpdate?'diperbarui':'disimpan'}! Akhir: ${akhir.toFixed(1)} (${predikat})`,'success');

        if(editingNilaiId){ editingNilaiId=null; document.getElementById('nilaiBanner').classList.remove('show'); document.getElementById('btnNilaiSubmit').textContent='Simpan Nilai'; }
        if(predikat==='A') confetti({particleCount:80,spread:55,origin:{y:0.6},colors:['#00f2ff','#7000ff','#fff']});
    }

    function editNilai(id) {
        const n=daftarNilai.find(x=>x.id===id); if(!n) return;
        editingNilaiId=id;
        switchTab('tab-nilai');
        refreshSelectSiswa(); refreshSelectMapelOnly();
        setTimeout(()=>{
            document.getElementById('nilaiSiswaSelect').value=n.siswaId;
            document.getElementById('nilaiMapelSelect').value=n.mapelId;
            document.getElementById('nilaiTugas').value=n.tugas;
            document.getElementById('nilaiUTS').value=n.uts;
            document.getElementById('nilaiUAS').value=n.uas;
            previewNilai();
            const siswa=daftarSiswa.find(s=>s.id===n.siswaId);
            const mapel=daftarMapel.find(m=>m.id===n.mapelId);
            const bannerEl=document.getElementById('nilaiBanner');
            bannerEl.classList.add('show');
            bannerEl.querySelector('.edit-mode-text').innerHTML=`✏ MODE EDIT — ${siswa?siswa.nama:''} · ${mapel?mapel.nama:''}`;
            document.getElementById('btnNilaiSubmit').textContent='Update Nilai';
            document.getElementById('nilaiSiswaSelect').scrollIntoView({behavior:'smooth'});
            showToast(`Mode edit nilai: ${siswa?siswa.nama:''} — ${mapel?mapel.nama:''}`,'info');
        },100);
    }

    function batalEditNilai() {
        editingNilaiId=null;
        document.getElementById('nilaiBanner').classList.remove('show');
        document.getElementById('btnNilaiSubmit').textContent='Simpan Nilai';
        ['nilaiTugas','nilaiUTS','nilaiUAS'].forEach(id=>{document.getElementById(id).value='';document.getElementById(id).classList.remove('input-error');});
        document.getElementById('nilaiSiswaSelect').value='';
        document.getElementById('nilaiMapelSelect').value='';
        document.getElementById('previewNilaiAkhir').style.display='none';
    }

    function hapusNilai(id) {
        if(!confirm('Hapus data nilai ini?')) return;
        daftarNilai=daftarNilai.filter(n=>n.id!==id);
        simpanState(); renderNilaiTable(); renderLeger();
        showToast('Data nilai berhasil dihapus.','success');
    }

    /* ======================================================
       RENDER TABEL NILAI
    ====================================================== */
    function renderNilaiTable() {
        const body=document.getElementById('nilaiTableBody'); if(!body) return;
        const q=(document.getElementById('nilaiSearchInput')?.value||'').toLowerCase().trim();
        const fPred=document.getElementById('nilaiFilterPredikat')?.value||'';
        const sortVal=document.getElementById('nilaiSort')?.value||'nis-az';
        const perPage=parseInt(document.getElementById('nilaiEntriesPerPage')?.value||10);

        let allRows=daftarNilai.map(n=>{
            const siswa=daftarSiswa.find(s=>s.id===n.siswaId)||{};
            const mapel=daftarMapel.find(m=>m.id===n.mapelId)||{};
            return {...n,siswaNama:siswa.nama||'?',siswaKelas:siswa.kelas||'',siswanis:siswa.nis||'',siswaNISN:siswa.nisn||'',mapelNama:mapel.nama||'?'};
        });

        allRows.sort((a,b)=>{
            if(sortVal==='nis-az') return (a.siswanis||'').localeCompare(b.siswanis||'',undefined,{numeric:true});
            if(sortVal==='nis-za') return (b.siswanis||'').localeCompare(a.siswanis||'',undefined,{numeric:true});
            if(sortVal==='siswa-az') return a.siswaNama.localeCompare(b.siswaNama);
            if(sortVal==='siswa-za') return b.siswaNama.localeCompare(a.siswaNama);
            if(sortVal==='mapel-az') return a.mapelNama.localeCompare(b.mapelNama);
            if(sortVal==='mapel-za') return b.mapelNama.localeCompare(a.mapelNama);
            if(sortVal==='nilai-tinggi') return b.akhir-a.akhir;
            if(sortVal==='nilai-rendah') return a.akhir-b.akhir;
            if(sortVal==='terbaru') return (b._ts||0)-(a._ts||0);
            if(sortVal==='terlama') return (a._ts||0)-(b._ts||0);
            return 0;
        });

        let filtered=allRows.filter(n=>{
            const matchQ=!q||n.siswaNama.toLowerCase().includes(q)||n.siswanis.includes(q)||n.mapelNama.toLowerCase().includes(q)||(n.siswaKelas||'').toLowerCase().includes(q);
            const matchP=!fPred||n.predikat===fPred;
            return matchQ&&matchP;
        });

        const total=allRows.length, filteredN=filtered.length;
        const totalPages=Math.max(1,Math.ceil(filteredN/perPage));
        if(nilaiPage>totalPages) nilaiPage=totalPages;
        const start=(nilaiPage-1)*perPage, end=Math.min(start+perPage,filteredN);
        const page=filtered.slice(start,end);

        if(filteredN===0) {
            body.innerHTML=`<tr><td colspan="11"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/10786/10786354.png" width="50px"/></div><div class="empty-state-text">${total===0?'Belum ada nilai tersimpan':'Tidak ada data yang cocok'}</div></div></td></tr>`;
            buildShowingInfo('nilaiShowingInfo',0,0,total,0);
            buildPagination('nilaiPagination',nilaiPage,0,'setNilaiPage'); return;
        }
        body.innerHTML=page.map((n,i)=>`
            <tr>
                <td style="color:var(--text-muted);font-size:0.78rem;">${start+i+1}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${n.siswaNISN||'—'}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${n.siswanis||'—'}</td>
                <td style="font-weight:600;">${n.siswaNama}</td>
                <td style="color:var(--text-muted);font-size:0.8rem;">${n.siswaKelas||'—'}</td>
                <td>${n.mapelNama}</td>
                <td style="text-align:center;">${Number(n.tugas).toFixed(1)}</td>
                <td style="text-align:center;">${Number(n.uts).toFixed(1)}</td>
                <td style="text-align:center;">${Number(n.uas).toFixed(1)}</td>
                <td style="text-align:center;font-weight:700;color:var(--accent)">${n.akhir.toFixed(1)}</td>
                <td style="text-align:center"><span class="badge-predikat badge-${n.predikat}">${n.predikat}</span></td>
                <td style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="btn-action btn-edit" onclick="editNilai('${n.id}')">✏ Edit</button>
                    <button class="btn-action" onclick="hapusNilai('${n.id}')">Hapus</button>
                </td>
            </tr>`).join('');
        buildShowingInfo('nilaiShowingInfo',start+1,end,total,filteredN);
        buildPagination('nilaiPagination',nilaiPage,totalPages,'setNilaiPage');
    }

    /* ======================================================
       LEGER
    ====================================================== */
    function renderLeger() {
        const body=document.getElementById('legerBody'); if(!body) return;
        const q=(document.getElementById('legerSearchInput')?.value||'').toLowerCase().trim();
        const fKelas=document.getElementById('legerFilterKelas')?.value||'';
        const fPredikat=document.getElementById('legerFilterPredikat')?.value||'';
        const sortVal=document.getElementById('legerSort')?.value||'nis-az';
        const perPage=parseInt(document.getElementById('legerEntriesPerPage')?.value||10);

        const allRows=daftarSiswa.map(s=>{
            const ns=daftarNilai.filter(n=>n.siswaId===s.id);
            const rataAll=ns.length>0?ns.reduce((x,n)=>x+n.akhir,0)/ns.length:null;
            const predikat=rataAll!==null?hitungPredikat(rataAll):'—';
            return{...s,rataAll,predikat,jumlahMapel:ns.length};
        });

        const kelasStat=fKelas?allRows.filter(r=>r.kelas===fKelas):allRows;
        updateStatLeger(kelasStat,fKelas);

        allRows.sort((a,b)=>{
            if(sortVal==='nilai-tinggi') return (b.rataAll||0)-(a.rataAll||0);
            if(sortVal==='nilai-rendah') return (a.rataAll||0)-(b.rataAll||0);
            if(sortVal==='nama-az') return a.nama.localeCompare(b.nama);
            if(sortVal==='nama-za') return b.nama.localeCompare(a.nama);
            if(sortVal==='nis-az') return a.nis.localeCompare(b.nis,undefined,{numeric:true});
            if(sortVal==='nis-za') return b.nis.localeCompare(a.nis,undefined,{numeric:true});
            if(sortVal==='terbaru') return (b._ts||0)-(a._ts||0);
            if(sortVal==='terlama') return (a._ts||0)-(b._ts||0);
            if(sortVal==='kelas-az') return (a.kelas||'').localeCompare(b.kelas||'',undefined,{numeric:true});
            if(sortVal==='kelas-za') return (b.kelas||'').localeCompare(a.kelas||'',undefined,{numeric:true});
            return 0;
        });

        let filtered=allRows.filter(s=>{
            const matchQ=!q||s.nama.toLowerCase().includes(q)||s.nis.toLowerCase().includes(q)||(s.kelas||'').toLowerCase().includes(q);
            const matchK=!fKelas||s.kelas===fKelas;
            const matchP=!fPredikat||s.predikat===fPredikat;
            return matchQ&&matchK&&matchP;
        });

        const total=allRows.length, filteredN=filtered.length;
        const totalPages=Math.max(1,Math.ceil(filteredN/perPage));
        if(legerPage>totalPages) legerPage=totalPages;
        const start=(legerPage-1)*perPage, end=Math.min(start+perPage,filteredN);
        const page=filtered.slice(start,end);

        if(filteredN===0) {
            body.innerHTML=`<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/16312/16312812.png" width="50px"/></div><div class="empty-state-text">${total===0?'Belum ada data siswa & nilai':'Tidak ada data yang cocok'}</div></div></td></tr>`;
            buildShowingInfo('legerShowingInfo',0,0,total,0);
            buildPagination('legerPagination',legerPage,0,'setLegerPage'); return;
        }
        body.innerHTML=page.map((s,i)=>`
            <tr>
                <td style="color:var(--text-muted);font-size:0.78rem;">${start+i+1}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${s.nisn || '—'}</td>
                <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${s.nis || '—'}</td>
                <td style="font-weight:600;">${s.nama}</td>
                <td style="color:var(--text-muted);font-size:0.8rem;">${s.kelas||'—'}</td>
                <td style="text-align:center;font-weight:700;color:${s.rataAll!==null?'var(--accent)':'var(--text-muted)'}">
                    ${s.rataAll!==null?s.rataAll.toFixed(1):'—'}
                    <span style="font-size:0.62rem;opacity:0.4;margin-left:3px;">${s.jumlahMapel>0?s.jumlahMapel+' mapel':''}</span>
                </td>
                <td style="text-align:center">
                    ${s.rataAll!==null?`<span class="badge-predikat badge-${s.predikat}">${s.predikat}</span>`:'<span style="opacity:0.3;font-size:0.76rem;">—</span>'}
                </td>
                <td style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="btn-action btn-rapor" onclick="lihatRapor('${s.id}')">Rapor</button>
                    <button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button>
                </td>
            </tr>`).join('');
        buildShowingInfo('legerShowingInfo',start+1,end,total,filteredN);
        buildPagination('legerPagination',legerPage,totalPages,'setLegerPage');
    }

    function updateStatLeger(rows,fKelas) {
        const dN=rows.filter(r=>r.rataAll!==null);
        const rataKelas=dN.length>0?dN.reduce((s,r)=>s+r.rataAll,0)/dN.length:null;
        const tertinggi=dN.length>0?Math.max(...dN.map(r=>r.rataAll)):null;
        const lulusCount=dN.filter(r=>r.rataAll>=75).length;
        document.getElementById('statTotalSiswa').textContent=rows.length;
        document.getElementById('statRataKelas').textContent=rataKelas!==null?rataKelas.toFixed(1):'—';
        document.getElementById('statTertinggi').textContent=tertinggi!==null?tertinggi.toFixed(1):'—';
        document.getElementById('statLulus').textContent=dN.length>0?`${lulusCount}/${dN.length}`:'—';
        const labelEl=document.getElementById('statKelasLabel');
        if(labelEl) labelEl.textContent=fKelas?`Kelas ${fKelas}`:'';
    }

    /* ======================================================
       PAGINATION
    ====================================================== */
    function buildPagination(containerId,currentPage,totalPages,setPageFn) {
        const wrap=document.getElementById(containerId); if(!wrap) return;
        if(totalPages<=1){wrap.innerHTML='';return;}
        let pages=[];
        for(let i=1;i<=totalPages;i++){
            if(i===1||i===totalPages||Math.abs(i-currentPage)<=1) pages.push(i);
            else if(pages[pages.length-1]!=='…') pages.push('…');
        }
        let html=`<button class="page-btn" onclick="${setPageFn}(${currentPage-1})" ${currentPage===1?'disabled':''}>‹ Prev</button>`;
        pages.forEach(p=>{
            if(p==='…') html+=`<button class="page-btn" disabled style="cursor:default">…</button>`;
            else html+=`<button class="page-btn ${p===currentPage?'active':''}" onclick="${setPageFn}(${p})">${p}</button>`;
        });
        html+=`<button class="page-btn" onclick="${setPageFn}(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>Next ›</button>`;
        wrap.innerHTML=html;
    }
    function buildShowingInfo(containerId,from,to,total,filteredTotal) {
        const el=document.getElementById(containerId); if(!el) return;
        if(total===0){el.innerHTML='';return;}
        const filterNote=filteredTotal<total?` (difilter dari <span>${total}</span> total data)`:'';
        el.innerHTML=`Menampilkan <span>${from}</span> – <span>${to}</span> dari <span>${filteredTotal}</span> data${filterNote}`;
    }

    /* ======================================================
       NAVIGASI TAB
    ====================================================== */
    function switchTab(tabId) {
        document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(b=>b.classList.remove('active'));
        const panel=document.getElementById(tabId); if(panel) panel.classList.add('active');
        const btn=document.querySelector(`[data-tab="${tabId}"]`); if(btn) btn.classList.add('active');
        if(tabId==='tab-sekolah') loadInfoSekolahForm();
        if(tabId==='tab-siswa') renderSiswaTable();
        if(tabId==='tab-mapel') renderMapelList();
        if(tabId==='tab-nilai'){ refreshSelectSiswa(); refreshSelectMapelOnly(); renderNilaiTable(); }
        if(tabId==='tab-leger') renderLeger();
    }

    window.addEventListener('DOMContentLoaded',()=>{
        initProvinsiSelect();
        loadInfoSekolahForm();
        renderSiswaTable(); renderMapelList(); renderNilaiTable(); renderLeger();
        refreshSelectSiswa(); refreshSelectMapelOnly();
    });

    /* ======================================================
       LIHAT RAPOR (MODAL PREVIEW)
    ====================================================== */
    function lihatRapor(siswaId) {
        const siswa=daftarSiswa.find(s=>s.id===siswaId); if(!siswa) return;
        currentRaporSiswaId = siswaId;
        const ns=daftarNilai.filter(n=>n.siswaId===siswaId);
        const rataAll=ns.length>0?ns.reduce((s,n)=>s+n.akhir,0)/ns.length:null;
        const predikat=rataAll!==null?hitungPredikat(rataAll):'—';
        const tanggal=new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'});
        const s=infoSekolah;
        const semester=s.semester||'';
        const tp=s.tahunPelajaran||'';
        const wali=siswa.waliKelas||s.kepsek||'—';

        const nilaiRows=ns.map((n,idx)=>{
            const mapel=daftarMapel.find(m=>m.id===n.mapelId);
            const kkm=mapel?mapel.kkm:75;
            const lulus=n.akhir>=kkm;
            return `<tr>
                <td style="text-align:center;font-size:0.75rem;">${idx+1}</td>
                <td style="text-align:left;">${mapel?mapel.nama:'—'}</td>
                <td style="text-align:center;font-size:0.8rem;">${kkm}</td>
                <td style="text-align:center;">${Number(n.tugas).toFixed(0)}</td>
                <td style="text-align:center;">${Number(n.uts).toFixed(0)}</td>
                <td style="text-align:center;">${Number(n.uas).toFixed(0)}</td>
                <td style="text-align:center;font-weight:700;color:${lulus?'#0891b2':'#dc2626'}">${n.akhir.toFixed(1)}</td>
                <td style="text-align:center;"><span style="display:inline-block;padding:2px 10px;border-radius:100px;font-size:0.7rem;font-weight:800;background:${{A:'#e0f7ff',B:'#ede9fe',C:'#fffbeb',D:'#fef2f2',E:'#fff5f5',F:'#f3f4f6'}[n.predikat]||'#f3f4f6'};color:${{A:'#0078a8',B:'#5b21b6',C:'#92400e',D:'#b91c1c',E:'#c53030',F:'#4b5563'}[n.predikat]||'#4b5563'};border:1px solid ${{A:'#7dd3f0',B:'#c4b5fd',C:'#fcd34d',D:'#fca5a5',E:'#feb2b2',F:'#d1d5db'}[n.predikat]||'#d1d5db'};">${n.predikat}</span></td>
                <td style="text-align:center;font-size:0.72rem;font-weight:700;color:${lulus?'#059669':'#dc2626'}">${lulus?'✓ Lulus':'✗ Remedial'}</td>
            </tr>`;
        }).join('');

        const kehadiran=siswa.kehadiran||{hadir:'—',sakit:'—',izin:'—',alpha:'—'};

        document.getElementById('modalRaporContent').innerHTML=`
        <div style="border:2px solid #003087;border-radius:8px;overflow:hidden;background:#fff;color:#111;">
            ${_kopRaporHTMLPrint()}
            <div style="background:#003087;color:#fff;text-align:center;padding:6px;font-size:0.75rem;letter-spacing:3px;font-weight:700;text-transform:uppercase;">LAPORAN HASIL BELAJAR PESERTA DIDIK</div>
            <div style="padding:14px 18px;">
                <table style="width:100%;font-size:0.82rem;border-collapse:collapse;margin-bottom:10px;">
                    <tr>
                        <td style="padding:3px 6px;width:30%;color:#555;">Nama Peserta Didik</td>
                        <td style="padding:3px 6px;width:2%;font-weight:700;">:</td>
                        <td style="padding:3px 6px;font-weight:700;">${siswa.nama}</td>
                        <td style="padding:3px 6px;width:25%;color:#555;">Semester</td>
                        <td style="padding:3px 6px;width:2%;">:</td>
                        <td style="padding:3px 6px;">${semester}</td>
                    </tr>
                    <tr>
                        <td style="padding:3px 6px;color:#555;">NISN / NIS</td>
                        <td style="padding:3px 6px;font-weight:700;">:</td>
                        <td style="padding:3px 6px;">${siswa.nisn||'—'} / ${siswa.nis||'—'}</td>
                        <td style="padding:3px 6px;color:#555;">Tahun Pelajaran</td>
                        <td style="padding:3px 6px;">:</td>
                        <td style="padding:3px 6px;">${tp}</td>
                    </tr>
                    <tr>
                        <td style="padding:3px 6px;color:#555;">Kelas</td>
                        <td style="padding:3px 6px;font-weight:700;">:</td>
                        <td style="padding:3px 6px;">${siswa.kelas||'—'}</td>
                        <td style="padding:3px 6px;color:#555;">Wali Kelas</td>
                        <td style="padding:3px 6px;">:</td>
                        <td style="padding:3px 6px;">${wali}</td>
                    </tr>
                </table>
            </div>
            <div style="padding:0 18px 10px;">
                <div style="font-size:0.7rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:#003087;margin-bottom:6px;border-bottom:1.5px solid #003087;padding-bottom:4px;">A. Nilai Pengetahuan dan Keterampilan</div>
                <div style="overflow-x:auto;">
                <table class="rapor-nilai-table" style="margin-bottom:0;font-size:0.78rem;">
                    <thead><tr>
                        <th style="width:4%;color:#12123a;">No</th>
                        <th style="text-align:left;width:26%;color:#12123a;">Mata Pelajaran</th>
                        <th style="color:#12123a;">KKM</th>
                        <th style="color:#12123a;">Tugas</th>
                        <th style="color:#12123a;">UTS</th>
                        <th style="color:#12123a;">UAS</th>
                        <th style="color:#12123a;">Nilai Akhir</th>
                        <th style="color:#12123a;">Predikat</th>
                        <th style="color:#12123a;">Keterangan</th>
                    </tr></thead>
                    <tbody>${nilaiRows||'<tr><td colspan="9" style="text-align:center;padding:16px;opacity:0.5;">Belum ada nilai</td></tr>'}</tbody>
                </table>
                </div>
            </div>
            <div style="padding:10px 18px;">
                <div style="font-size:0.7rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:#003087;margin-bottom:6px;border-bottom:1.5px solid #003087;padding-bottom:4px;">B. Rekap Kehadiran</div>
                <table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
                    <tr>
                        <td style="padding:4px 8px;background:#f0f4ff;border:1px solid #dde;text-align:center;font-weight:700;">Hadir</td>
                        <td style="padding:4px 8px;background:#f0f4ff;border:1px solid #dde;text-align:center;font-weight:700;">Sakit</td>
                        <td style="padding:4px 8px;background:#f0f4ff;border:1px solid #dde;text-align:center;font-weight:700;">Izin</td>
                        <td style="padding:4px 8px;background:#f0f4ff;border:1px solid #dde;text-align:center;font-weight:700;">Alpha</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 8px;border:1px solid #dde;text-align:center;">${kehadiran.hadir||'—'} hari</td>
                        <td style="padding:4px 8px;border:1px solid #dde;text-align:center;">${kehadiran.sakit||'—'} hari</td>
                        <td style="padding:4px 8px;border:1px solid #dde;text-align:center;">${kehadiran.izin||'—'} hari</td>
                        <td style="padding:4px 8px;border:1px solid #dde;text-align:center;">${kehadiran.alpha||'—'} hari</td>
                    </tr>
                </table>
            </div>
            <div style="padding:10px 18px 14px;">
                <div style="font-size:0.7rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:#003087;margin-bottom:6px;border-bottom:1.5px solid #003087;padding-bottom:4px;">C. Catatan Wali Kelas</div>
                <div style="min-height:36px;font-size:0.82rem;border:1px solid #dde;border-radius:4px;padding:8px 10px;color:#444;">${siswa.catatan||'—'}</div>
            </div>
            <div style="padding:0 18px 10px;">
                <div style="font-size:0.7rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:#003087;margin-bottom:6px;border-bottom:1.5px solid #003087;padding-bottom:4px;">D. Keterangan Predikat</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:0.72rem;margin-bottom:8px;">
                    ${[['A','90–100','Sangat Baik','#0891b2'],['B','80–89','Baik','#7c3aed'],['C','70–79','Cukup','#d97706'],['D','60–69','Kurang','#dc2626'],['E','50–59','Sangat Kurang','#6b7280'],['F','< 50','Tidak Lulus','#374151']].map(([p,r,k,c])=>`<div style="display:flex;align-items:center;gap:5px;background:#f8f9ff;border:1px solid #eee;border-radius:6px;padding:3px 8px;"><span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:1px 7px;border-radius:100px;font-weight:800;">${p}</span><span style="color:#444;">${r} — ${k}</span></div>`).join('')}
                </div>
                <div style="font-size:0.72rem;color:#555;text-align:right;">${s.kota||'________'}, ${tanggal}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:10px 18px 16px;border-top:1px solid #dde;font-size:0.8rem;text-align:center;">
                <div>
                    <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Orang Tua / Wali</div>
                    <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
                    <div style="font-size:0.7rem;color:#555;margin-top:4px;">(________________)</div>
                </div>
                <div>
                    <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Wali Kelas</div>
                    <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
                    <div style="font-size:0.7rem;color:#333;font-weight:700;margin-top:4px;">${wali}</div>
                    ${s.nip?`<div style="font-size:0.62rem;color:#666;">NIP. ${s.nip}</div>`:''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Kepala Sekolah</div>
                    <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
                    <div style="font-size:0.7rem;color:#333;font-weight:700;margin-top:4px;text-align:center;">${s.kepsek||'—'}</div>
                    ${s.nipKepsek?`<div style="font-size:0.62rem;color:#666;text-align:center;">NIP. ${s.nipKepsek}</div>`:''}
                </div>
            </div>
        </div>
        `;
        document.getElementById('modalRapor').classList.add('open');
    }

    function tutupRapor(){ document.getElementById('modalRapor').classList.remove('open'); currentRaporSiswaId = null; }

    /* ======================================================
       KOP RAPOR UNTUK PRINT
    ====================================================== */
    function _kopRaporHTMLPrint() {
        const s=infoSekolah;
        const nama=s.nama||'NAMA SEKOLAH';
        const npsn=s.npsn?`NPSN: ${s.npsn}`:'';
        const parts=[]; if(s.alamat) parts.push(s.alamat);
        const lok=[s.kota,s.provinsi].filter(Boolean).join(', '); if(lok) parts.push(lok);
        if(s.kodePos) parts.push(`Kode Pos ${s.kodePos}`);
        const alamat=parts.join(', ');
        const kParts=[]; if(s.telepon) kParts.push(`Telp: ${s.telepon}`);
        if(s.email) kParts.push(`Email: ${s.email}`); if(s.website) kParts.push(`Web: ${s.website}`);
        const kontak=kParts.join('  |  ');
        const logoEl=s.logo?`<img src="${s.logo}" style="width:62px;height:62px;object-fit:cover;border-radius:50%;">`:`<div style="width:62px;height:62px;background:#eee;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.52rem;color:#999;text-align:center;border:2px solid #ccc;">Logo<br>Sekolah</div>`;
        return `
        <div style="background:#fff;padding:12px 20px 8px;border-bottom:4px double #003087;">
            <div style="display:flex;align-items:center;gap:14px;">
                <div style="flex-shrink:0;">${logoEl}</div>
                <div style="text-align:center;flex:1;">
                    <div style="font-size:0.62rem;font-weight:700;letter-spacing:2px;color:#333;text-transform:uppercase;line-height:1.7;">PEMERINTAH PROVINSI ${s.provinsi || ''}</div>
                    <div style="font-size:0.62rem;font-weight:700;letter-spacing:2px;color:#333;text-transform:uppercase;margin-bottom:3px;line-height:1.7;">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
                    <div style="font-size:1.1rem;font-weight:900;color:#003087;letter-spacing:0.5px;text-transform:uppercase;">${nama}</div>
                    ${npsn?`<div style="font-size:0.65rem;color:#555;">${npsn}</div>`:''}
                    ${alamat?`<div style="font-size:0.65rem;color:#444;">${alamat}</div>`:''}
                    ${kontak?`<div style="font-size:0.62rem;color:#555;">${kontak}</div>`:''}
                </div>
                <div style="flex-shrink:0;width:62px;height:62px;background:#eee;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.52rem;color:#888;text-align:center;"><img src="tut wuri handayani.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></img></div>
            </div>
        </div>`;
    }

    /* ======================================================
       CETAK RAPOR FORMAL (PRINT WINDOW)
    ====================================================== */
    function printRapor() {
        if (!currentRaporSiswaId) { showToast('Data siswa tidak ditemukan!', 'error'); return; }
        const siswa = daftarSiswa.find(s => s.id === currentRaporSiswaId);
        if (!siswa) { showToast('Data siswa tidak ditemukan!', 'error'); return; }
        tutupRapor();
        _bukaWindowRapor([siswa]);
    }

    function cetakRaporSemua() {
        if(daftarSiswa.length===0){ showToast('Tidak ada data siswa!','warning'); return; }
        const fKelas=document.getElementById('legerFilterKelas')?.value||'';
        let sorted=fKelas?daftarSiswa.filter(s=>s.kelas===fKelas):[...daftarSiswa];
        sorted.sort((a,b)=>{
            const nA=daftarNilai.filter(n=>n.siswaId===a.id);
            const nB=daftarNilai.filter(n=>n.siswaId===b.id);
            const rA=nA.length>0?nA.reduce((s,n)=>s+n.akhir,0)/nA.length:0;
            const rB=nB.length>0?nB.reduce((s,n)=>s+n.akhir,0)/nB.length:0;
            return rB-rA;
        });
        if(sorted.length===0){ showToast('Tidak ada siswa ditemukan!','warning'); return; }
        _bukaWindowRapor(sorted);
        showToast(`Membuka rapor ${sorted.length} siswa${fKelas?' kelas '+fKelas:''}...`,'info');
    }

    function _cetakRaporSiswaHTML(siswa) {
        const ns=daftarNilai.filter(n=>n.siswaId===siswa.id);
        const rataAll=ns.length>0?ns.reduce((s,n)=>s+n.akhir,0)/ns.length:null;
        const predikat=rataAll!==null?hitungPredikat(rataAll):'—';
        const tanggal=new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'});
        const s=infoSekolah;
        const semester=s.semester||'';
        const tp=s.tahunPelajaran||'';
        const wali=siswa.waliKelas||s.kepsek||'—';
        const kehadiran=siswa.kehadiran||{hadir:'—',sakit:'—',izin:'—',alpha:'—'};
        function wP(p){return p==='A'?'#0891b2':p==='B'?'#7c3aed':p==='C'?'#d97706':p==='D'?'#dc2626':p==='E'?'#6b7280':'#374151';}
        function bP(p){return p==='A'?'#e0fffe':p==='B'?'#f3e8ff':p==='C'?'#fffbeb':p==='D'?'#fef2f2':p==='E'?'#f9fafb':'#f3f4f6';}
        const predColor=wP(predikat);

        const nilaiRows=ns.map((n,i)=>{
            const mapel=daftarMapel.find(m=>m.id===n.mapelId);
            const kkm=mapel?mapel.kkm:75; const lulus=n.akhir>=kkm; const pred=n.predikat;
            return `<tr style="background:${i%2===0?'#fff':'#f8faff'}">
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;font-size:0.78rem;color:#777;">${i+1}</td>
                <td style="padding:7px 10px;border:1px solid #dde;text-align:left;font-weight:600;color:#1e1e4a;">${mapel?mapel.nama:'—'}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;font-size:0.82rem;">${kkm}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;">${Number(n.tugas).toFixed(0)}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;">${Number(n.uts).toFixed(0)}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;">${Number(n.uas).toFixed(0)}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;font-weight:800;font-size:1rem;color:${lulus?'#0891b2':'#dc2626'}">${n.akhir.toFixed(1)}</td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;"><span style="background:${bP(pred)};color:${wP(pred)};padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:800;border:1px solid ${wP(pred)}44;">${pred}</span></td>
                <td style="padding:7px 8px;border:1px solid #dde;text-align:center;font-size:0.75rem;font-weight:700;color:${lulus?'#059669':'#dc2626'}">${lulus?'✓ Lulus':'✗ Remedial'}</td>
            </tr>`;
        }).join('');
        const kosong=ns.length===0?`<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;border:1px solid #dde;">Belum ada data nilai</td></tr>`:'';
        const namaSekolah=s.nama||'NAMA SEKOLAH';
        const npsn=s.npsn?`NPSN: ${s.npsn}`:'';
        const _aParts=[]; if(s.alamat) _aParts.push(s.alamat);
        const _lok=[s.kota,s.provinsi].filter(Boolean).join(', '); if(_lok) _aParts.push(_lok);
        if(s.kodePos) _aParts.push(`Kode Pos ${s.kodePos}`);
        const alamat=_aParts.join(', ');

        return `
<div class="rapor-page">
<div class="rapor-wrapper">
<!-- KOP SURAT -->
<div style="background:#fff;padding:12px 24px 8px;border-bottom:4px double #003087;">
  <div style="display:flex;align-items:center;gap:14px;">
    <div style="flex-shrink:0;">${s.logo?`<img src="${s.logo}" style="width:65px;height:65px;object-fit:cover;border-radius:50%;">`:`<div style="width:65px;height:65px;background:#eef;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.52rem;color:#99a;text-align:center;border:2px solid #9ad;">Logo<br>Sekolah</div>`}</div>
    <div style="text-align:center;flex:1;">
      <div style="font-size:0.62rem;font-weight:700;letter-spacing:2px;color:#333;text-transform:uppercase;line-height:1.7;">PEMERINTAH PROVINSI ${s.provinsi || ''}</div>
      <div style="font-size:0.62rem;font-weight:700;letter-spacing:2px;color:#333;text-transform:uppercase;margin-bottom:3px;line-height:1.7;">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
      <div style="font-size:1.1rem;font-weight:900;color:#003087;letter-spacing:0.5px;text-transform:uppercase;">${namaSekolah}</div>
      ${npsn?`<div style="font-size:0.65rem;color:#555;">${npsn}</div>`:''}
      ${alamat?`<div style="font-size:0.65rem;color:#444;">${alamat}</div>`:''}
      ${s.telepon||s.email||s.website?`<div style="font-size:0.62rem;color:#555;">${[s.telepon?'Telp: '+s.telepon:'',s.email?'Email: '+s.email:'',s.website?'Web: '+s.website:''].filter(Boolean).join('  |  ')}</div>`:''}
    </div>
    <div style="flex-shrink:0;width:65px;height:65px;background:#eef;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.52rem;color:#99a;text-align:center;border:2px solid #9ad;"><img src="tut wuri handayani.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></img></div>
  </div>
</div>
<!-- JUDUL -->
<div style="background:#003087;color:#fff;text-align:center;padding:7px;font-size:0.78rem;letter-spacing:3px;font-weight:700;text-transform:uppercase;">LAPORAN HASIL BELAJAR PESERTA DIDIK</div>
<!-- IDENTITAS SISWA -->
<div style="padding:10px 24px;">
  <table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
    <tr>
      <td style="padding:2px 6px;width:30%;color:#555;">Nama Peserta Didik</td>
      <td style="padding:2px 3px;font-weight:700;width:2%;">:</td>
      <td style="padding:2px 6px;font-weight:700;">${siswa.nama}</td>
      <td style="padding:2px 6px;width:26%;color:#555;">Semester</td>
      <td style="padding:2px 3px;width:2%;">:</td>
      <td style="padding:2px 6px;">${semester}</td>
    </tr>
    <tr>
      <td style="padding:2px 6px;color:#555;">NIS / NISN</td>
      <td style="padding:2px 3px;font-weight:700;">:</td>
      <td style="padding:2px 6px;">${siswa.nis} / ${siswa.nisn||'—'}</td>
      <td style="padding:2px 6px;color:#555;">Tahun Pelajaran</td>
      <td style="padding:2px 3px;">:</td>
      <td style="padding:2px 6px;">${tp}</td>
    </tr>
    <tr>
      <td style="padding:2px 6px;color:#555;">Kelas</td>
      <td style="padding:2px 3px;font-weight:700;">:</td>
      <td style="padding:2px 6px;">${siswa.kelas||'—'}</td>
      <td style="padding:2px 6px;color:#555;">Wali Kelas</td>
      <td style="padding:2px 3px;">:</td>
      <td style="padding:2px 6px;">${wali}</td>
    </tr>
  </table>
</div>
<!-- NILAI -->
<div style="padding:0 24px 8px;">
  <div style="font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#003087;border-bottom:1.5px solid #003087;padding-bottom:3px;margin-bottom:7px;">A. NILAI PENGETAHUAN DAN KETERAMPILAN</div>
  <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
    <colgroup><col style="width:4%"><col style="width:26%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:10%"><col style="width:10%"><col style="width:22%"></colgroup>
    <thead>
      <tr style="background:#003087;">
        ${['No','Mata Pelajaran','KKM','Tugas','UTS','UAS','Nilai Akhir','Predikat','Keterangan'].map((h,i)=>`<th style="padding:7px ${i===1?'10px':'6px'};text-align:${i===1?'left':'center'};color:#fff;font-size:0.62rem;font-weight:700;letter-spacing:1px;border:1px solid #1152b3;">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>${nilaiRows}${kosong}</tbody>
    ${rataAll!==null?`<tr style="background:#eef3ff;">
      <td colspan="6" style="padding:7px 10px;border:1px solid #dde;text-align:right;font-weight:700;font-size:0.8rem;color:#003087;">Rata-rata Keseluruhan</td>
      <td style="padding:7px 6px;border:1px solid #dde;text-align:center;font-weight:900;font-size:1rem;color:${predColor};">${rataAll.toFixed(1)}</td>
      <td style="padding:7px 6px;border:1px solid #dde;text-align:center;"><span style="background:${bP(predikat)};color:${predColor};padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:800;border:1px solid ${predColor}44;">${predikat}</span></td>
      <td style="padding:7px 6px;border:1px solid #dde;text-align:center;font-size:0.75rem;font-weight:700;color:${rataAll>=75?'#059669':'#dc2626'}">${rataAll>=75?'✓ LULUS':'✗ BELUM LULUS'}</td>
    </tr>`:''}
  </table>
</div>
<!-- KEHADIRAN -->
<div style="padding:0 24px 8px;">
  <div style="font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#003087;border-bottom:1.5px solid #003087;padding-bottom:3px;margin-bottom:7px;">B. REKAP KEHADIRAN</div>
  <table style="width:60%;border-collapse:collapse;font-size:0.82rem;">
    <tr>
      <th style="padding:6px 10px;background:#003087;color:#fff;border:1px solid #1152b3;font-size:0.72rem;">Hadir</th>
      <th style="padding:6px 10px;background:#003087;color:#fff;border:1px solid #1152b3;font-size:0.72rem;">Sakit</th>
      <th style="padding:6px 10px;background:#003087;color:#fff;border:1px solid #1152b3;font-size:0.72rem;">Izin</th>
      <th style="padding:6px 10px;background:#003087;color:#fff;border:1px solid #1152b3;font-size:0.72rem;">Alpha</th>
    </tr>
    <tr style="background:#fff;">
      <td style="padding:6px 10px;border:1px solid #dde;text-align:center;">${kehadiran.hadir||'—'} hari</td>
      <td style="padding:6px 10px;border:1px solid #dde;text-align:center;">${kehadiran.sakit||'—'} hari</td>
      <td style="padding:6px 10px;border:1px solid #dde;text-align:center;">${kehadiran.izin||'—'} hari</td>
      <td style="padding:6px 10px;border:1px solid #dde;text-align:center;">${kehadiran.alpha||'—'} hari</td>
    </tr>
  </table>
</div>
<!-- CATATAN -->
<div style="padding:0 24px 8px;">
  <div style="font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#003087;border-bottom:1.5px solid #003087;padding-bottom:3px;margin-bottom:7px;">C. CATATAN WALI KELAS</div>
  <div style="min-height:40px;border:1px solid #dde;border-radius:4px;padding:8px 10px;font-size:0.82rem;color:#444;">${siswa.catatan||'—'}</div>
</div>
<!-- KETERANGAN PREDIKAT -->
<div style="padding:0 24px 8px;">
  <div style="font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#003087;border-bottom:1.5px solid #003087;padding-bottom:3px;margin-bottom:7px;">D. KETERANGAN PREDIKAT</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:0.72rem;">
    ${[['A','90–100','Sangat Baik','#0891b2'],['B','80–89','Baik','#7c3aed'],['C','70–79','Cukup','#d97706'],['D','60–69','Kurang','#dc2626'],['E','50–59','Sangat Kurang','#6b7280'],['F','< 50','Tidak Lulus','#374151']].map(([p,r,k,c])=>`<div style="display:flex;align-items:center;gap:5px;background:#f8f9ff;border:1px solid #eee;border-radius:6px;padding:3px 8px;"><span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:1px 7px;border-radius:100px;font-weight:800;">${p}</span><span>${r} — ${k}</span></div>`).join('')}
  </div>
  <div style="margin-top:8px;font-size:0.72rem;color:#555;text-align:right;">${s.kota||'______'}, ${tanggal}</div>
</div>
<!-- TANDA TANGAN -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 24px 16px;border-top:1px solid #dde;font-size:0.78rem;text-align:center;">
    <div>
        <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Orang Tua / Wali</div>
        <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
        <div style="font-size:0.7rem;color:#555;margin-top:4px;">(________________)</div>
    </div>
    <div>
        <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Wali Kelas</div>
        <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
        <div style="font-size:0.7rem;color:#333;font-weight:700;margin-top:4px;">${wali}</div>
        ${s.nip?`<div style="font-size:0.62rem;color:#666;">NIP. ${s.nip}</div>`:''}
    </div>
    <div style="text-align:right;">
        <div style="font-size:0.65rem;color:#777;margin-bottom:32px;text-align:center;">Kepala Sekolah</div>
        <div style="border-bottom:1px solid #333;margin:0 10px;"></div>
        <div style="font-size:0.7rem;color:#333;font-weight:700;margin-top:4px;text-align:center;">${s.kepsek||'—'}</div>
        ${s.nipKepsek?`<div style="font-size:0.62rem;color:#666;text-align:center;">NIP. ${s.nipKepsek}</div>`:''}
    </div>
</div>
</div><!-- /rapor-wrapper -->
</div><!-- /rapor-page -->`;
    }

    function _bukaWindowRapor(listSiswa) {
        const tanggal=new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'});
        const semuaRapor=listSiswa.map(siswa=>_cetakRaporSiswaHTML(siswa)).join('');
        const win=window.open('','_blank');
        if(!win){ showToast('Pop-up diblokir! Izinkan pop-up untuk mencetak.','error'); return; }
        win.document.write(`<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8">
<title>Rapor — ${tanggal}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#e8edf8;color:#12123a;}
.rapor-page{width:210mm;min-height:297mm;margin:0 auto;padding:8mm;display:flex;align-items:flex-start;}
.rapor-wrapper{width:100%;background:#fff;border:1px solid #ccd;box-shadow:0 2px 20px rgba(0,0,100,0.1);}
@media screen{body{padding:16px 0;}.rapor-page{margin-bottom:20px;}}
@media print{
  @page{size:A4 portrait;margin:0;}
  *,*::before,*::after{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  html,body{background:#fff;margin:0;padding:0;}
  .rapor-page{width:210mm;min-height:297mm;page-break-before:always;break-before:page;page-break-after:always;break-after:page;padding:6mm;margin:0;box-shadow:none;}
  .rapor-page:first-child{page-break-before:auto;break-before:auto;}
  .rapor-wrapper{border:none;box-shadow:none;width:100%;}
}
</style></head>
<body>${semuaRapor}
<script>document.fonts.ready.then(function(){window.print();});<\/script>
</body></html>`);
        win.document.close();
    }

    /* ======================================================
       EXPORT MODAL
    ====================================================== */
    let _exportFormat='csv', _exportScope='semua';

    function bukaModalExport() {
        if(daftarSiswa.length===0){ showToast('Tidak ada data siswa untuk diekspor!','warning'); return; }
        _exportFormat='csv'; _exportScope='semua';
        ['exportBtnCSV','exportBtnXLSX','exportBtnPDF'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
        ['exportBtnSemua','exportBtnKelas','exportBtnSiswa'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
        document.getElementById('exportBtnCSV')?.classList.add('selected');
        document.getElementById('exportBtnSemua')?.classList.add('selected');
        document.getElementById('exportKelasWrap').style.display='none';
        document.getElementById('exportSiswaWrap').style.display='none';
        refreshExportSiswaSelect();
        document.getElementById('modalExport').classList.add('open');
    }

    function tutupExport(){ document.getElementById('modalExport').classList.remove('open'); }

    function pilihExportFormat(f) {
        _exportFormat=f;
        ['exportBtnCSV','exportBtnXLSX','exportBtnPDF'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
        document.getElementById({csv:'exportBtnCSV',xlsx:'exportBtnXLSX',pdf:'exportBtnPDF'}[f])?.classList.add('selected');
    }

    function pilihExportScope(s) {
        _exportScope=s;
        ['exportBtnSemua','exportBtnKelas','exportBtnSiswa'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
        document.getElementById({semua:'exportBtnSemua',kelas:'exportBtnKelas',siswa:'exportBtnSiswa'}[s])?.classList.add('selected');
        document.getElementById('exportKelasWrap').style.display=s==='kelas'?'block':'none';
        document.getElementById('exportSiswaWrap').style.display=s==='siswa'?'block':'none';
    }

    function doExport() {
        let targetSiswa=[...daftarSiswa];
        if(_exportScope==='kelas') {
            const kelas=document.getElementById('exportKelasSelect')?.value;
            if(!kelas){ showToast('Pilih kelas terlebih dahulu!','error'); return; }
            targetSiswa=daftarSiswa.filter(s=>s.kelas===kelas);
            if(targetSiswa.length===0){ showToast(`Tidak ada siswa di kelas "${kelas}"!`,'warning'); return; }
        } else if(_exportScope==='siswa') {
            const siswaId=document.getElementById('exportSiswaSelect')?.value;
            if(!siswaId){ showToast('Pilih siswa terlebih dahulu!','error'); return; }
            targetSiswa=daftarSiswa.filter(s=>s.id===siswaId);
        }
        tutupExport();
        if(_exportFormat==='csv') exportCSV(targetSiswa);
        else if(_exportFormat==='xlsx') exportXLSX(targetSiswa);
        else if(_exportFormat==='pdf') _bukaWindowRapor(targetSiswa);
    }

    function exportCSV(targetSiswa) {
        const BOM='\uFEFF', sep=',';
        const tanggal=new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'});
        const mapelHeaders=daftarMapel.flatMap(m=>[`${m.nama} (Tugas)`,`${m.nama} (UTS)`,`${m.nama} (UAS)`,`${m.nama} (Akhir)`]);
        let rows=[
            ['REKAP DATA NILAI SISWA'],
            ['Sekolah: '+(infoSekolah.nama||'—')],
            ['Dicetak: '+tanggal],
            [],
            ['No','NIS','NISN','Nama Siswa','Kelas',...mapelHeaders,'Rata-rata','Predikat','Keterangan']
        ];
        targetSiswa.forEach((s,i)=>{
            const ns=daftarNilai.filter(n=>n.siswaId===s.id);
            let row=[`${i+1}`,s.nis,s.nisn||'',s.nama,s.kelas||'-'];
            daftarMapel.forEach(m=>{
                const n=ns.find(x=>x.mapelId===m.id);
                row.push(...(n?[Number(n.tugas).toFixed(1),Number(n.uts).toFixed(1),Number(n.uas).toFixed(1),Number(n.akhir).toFixed(1)]:['—','—','—','—']));
            });
            const rataRaw=ns.length>0?ns.reduce((s,n)=>s+n.akhir,0)/ns.length:null;
            row.push(
                rataRaw!==null?rataRaw.toFixed(1):'—',
                rataRaw!==null?hitungPredikat(rataRaw):'—',
                rataRaw!==null?(rataRaw>=75?'Lulus':'Belum Lulus'):'—'
            );
            rows.push(row);
        });
        rows.push([]);
        rows.push(['Keterangan Predikat']);
        rows.push(['A = 100–90','Sangat Baik']);rows.push(['B = 89–80','Baik']);
        rows.push(['C = 79–70','Cukup']);rows.push(['D = 69–60','Kurang']);
        rows.push(['E = 59–50','Sangat Kurang']);rows.push(['F = < 50','Tidak Lulus']);
        const csv=BOM+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(sep)).join('\r\n');
        const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url;
        a.download=`REKAP_NILAI_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
        showToast(`Berhasil export ${targetSiswa.length} siswa ke CSV!`,'success');
    }

    function exportXLSX(targetSiswa) {
        if(typeof XLSX==='undefined'){ showToast('Library Excel belum termuat! Refresh halaman.','error'); return; }
        const tanggal=new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'});
        const wb=XLSX.utils.book_new();
        const mapelHeaders=daftarMapel.flatMap(m=>[`${m.nama} (Tugas)`,`${m.nama} (UTS)`,`${m.nama} (UAS)`,`${m.nama} (Akhir)`]);
        const header=['No','NIS','NISN','Nama Siswa','Kelas',...mapelHeaders,'Rata-rata','Predikat','Keterangan'];
        const aoa=[['REKAP DATA NILAI SISWA'],['Sekolah: '+(infoSekolah.nama||'—')],['Dicetak: '+tanggal],[],header];
        targetSiswa.forEach((s,i)=>{
            const ns=daftarNilai.filter(n=>n.siswaId===s.id);
            let row=[i+1,s.nis,s.nisn||'',s.nama,s.kelas||'-'];
            daftarMapel.forEach(m=>{
                const n=ns.find(x=>x.mapelId===m.id);
                row.push(...(n?[Number(n.tugas),Number(n.uts),Number(n.uas),parseFloat(n.akhir.toFixed(2))]:['','','','']));
            });
            const rataRaw=ns.length>0?ns.reduce((s,n)=>s+n.akhir,0)/ns.length:null;
            row.push(rataRaw!==null?parseFloat(rataRaw.toFixed(2)):'—',rataRaw!==null?hitungPredikat(rataRaw):'—',rataRaw!==null?(rataRaw>=75?'Lulus':'Belum Lulus'):'—');
            aoa.push(row);
        });
        const ws1=XLSX.utils.aoa_to_sheet(aoa);
        ws1['!cols']=[{wch:4},{wch:12},{wch:12},{wch:22},{wch:12},...daftarMapel.flatMap(()=>[{wch:8},{wch:8},{wch:8},{wch:8}]),{wch:10},{wch:9},{wch:12}];
        XLSX.utils.book_append_sheet(wb,ws1,'Rekap Nilai');
        const aoa2=[['No','NIS','NISN','Nama','Kelas','Wali Kelas']];
        targetSiswa.forEach((s,i)=>aoa2.push([i+1,s.nis,s.nisn||'',s.nama,s.kelas||'-',s.waliKelas||'-']));
        const ws2=XLSX.utils.aoa_to_sheet(aoa2);
        ws2['!cols']=[{wch:4},{wch:12},{wch:12},{wch:22},{wch:12},{wch:20}];
        XLSX.utils.book_append_sheet(wb,ws2,'Data Siswa');
        const aoa3=[['No','Nama Mapel','Guru','NIP','Kelas','KKM']];
        daftarMapel.forEach((m,i)=>aoa3.push([i+1,m.nama,m.guru,m.nip||'-',m.kelas||'-',m.kkm]));
        const ws3=XLSX.utils.aoa_to_sheet(aoa3);
        ws3['!cols']=[{wch:4},{wch:20},{wch:22},{wch:18},{wch:12},{wch:6}];
        XLSX.utils.book_append_sheet(wb,ws3,'Mata Pelajaran');
        XLSX.writeFile(wb,`REKAP_NILAI_${new Date().toISOString().slice(0,10)}.xlsx`);
        showToast(`Berhasil export ${targetSiswa.length} siswa ke Excel!`,'success');
    }

    /* ======================================================
       MODAL CLOSE
    ====================================================== */
    document.getElementById('modalRapor')?.addEventListener('click',function(e){if(e.target===this) tutupRapor();});
    document.getElementById('modalExport')?.addEventListener('click',function(e){if(e.target===this) tutupExport();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){tutupRapor();tutupExport();}});