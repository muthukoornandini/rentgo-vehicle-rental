
import React, { useEffect, useState } from 'react';
import { api, money, todayStr, daysBetween } from '../api.js';

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const vehicleImages = {
  'Maruti Swift': photo('photo-1549317661-bd32c8ce0db2'),
  'Honda City': photo('photo-1552519507-da3b142c6e3d'),
  'Hyundai Creta': photo('photo-1519641471654-76ce0107ad1b'),
  'Mahindra Thar': photo('photo-1503376780353-7e6692767b70'),
  'Toyota Innova Crysta': photo('photo-1563720223185-11003d516935'),
  'KTM Duke 200': photo('photo-1558981806-ec527fa84c39'),
  'Bajaj Pulsar 150': photo('photo-1558981403-c5f9899a28bc'),
  'Honda Activa': photo('photo-1558981806-ec527fa84c39'),
  'Ola S1 Electric': photo('photo-1558981403-c5f9899a28bc'),
  'Maruti Baleno': photo('photo-1494976388531-d1058494cdd8'),
  'Hyundai i20': photo('photo-1503376780353-7e6692767b70'),
  'Honda Amaze': photo('photo-1552519507-da3b142c6e3d'),
  'Kia Seltos': photo('photo-1519641471654-76ce0107ad1b'),
  'Mahindra Scorpio N': photo('photo-1519641471654-76ce0107ad1b'),
  'Toyota Fortuner': photo('photo-1519641471654-76ce0107ad1b'),
  'Royal Enfield Classic 350': photo('photo-1558981403-c5f9899a28bc'),
  'Yamaha R15': photo('photo-1558981806-ec527fa84c39'),
  'TVS Apache RTR 160': photo('photo-1558981403-c5f9899a28bc'),
  'Suzuki Access 125': photo('photo-1558981806-ec527fa84c39'),
    'Tata Nexon EV': photo('photo-1593941707882-a5bba14938c7'),
  'Range Rover': photo('photo-1519641471654-76ce0107ad1b'),
  'Royal Enfield Classic 350': photo('photo-1558981403-c5f9899a28bc'),
  'Force Tempo Traveller': photo('photo-1519003722824-194d4455a60c'),
  'Tempo Traveller': photo('photo-1519003722824-194d4455a60c'),
};

const fallbackImage =
  'https://placehold.co/900x500/f1f5f9/334155?text=Vehicle+Photo';

export default function Vehicles({ dates, setDates, onBook, isAdmin }) {
  const [vehicles, setVehicles] = useState([]);
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('price-asc');
  const [loadError, setLoadError] = useState('');

  const days = daysBetween(dates.start, dates.end);

  useEffect(() => {
    let cancelled = false;

    const query =
      daysBetween(dates.start, dates.end) > 0
        ? `?start=${encodeURIComponent(dates.start)}&end=${encodeURIComponent(dates.end)}`
        : '';

    setLoadError('');

    api('/vehicles' + query)
      .then((data) => {
        if (!cancelled) {
          setVehicles(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error('Could not load vehicles:', error);
        if (!cancelled) {
          setLoadError('Could not load vehicles. Please refresh the page.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dates.start, dates.end]);

  const types = ['All', ...new Set(vehicles.map((v) => v.type))];

  const shown = vehicles
    .filter((v) => {
      const text = `${v.name} ${v.description || ''} ${v.type || ''}`;
      return (
        (type === 'All' || v.type === type) &&
        text.toLowerCase().includes(search.trim().toLowerCase())
      );
    })
    .sort((a, b) =>
      sort === 'price-asc'
        ? a.pricePerDay - b.pricePerDay
        : b.pricePerDay - a.pricePerDay
    );

  return (
    <>
      <div className="card datebar">
        <label>
          Pickup date
          <input
            type="date"
            min={todayStr()}
            value={dates.start}
            onChange={(e) => {
              const start = e.target.value;
              setDates({
                start,
                end: dates.end < start ? start : dates.end,
              });
            }}
          />
        </label>

        <label>
          Return date
          <input
            type="date"
            min={dates.start}
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </label>

        <div className="daysbox">
          {days > 0 ? (
            <>
              <b>{days}</b> day{days > 1 ? 's' : ''}
            </>
          ) : (
            'Choose valid dates'
          )}
        </div>
      </div>

      <div className="toolbar">
        <input
          type="search"
          aria-label="Search vehicles"
          placeholder="🔍 Search cars, bikes and scooters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          aria-label="Sort vehicles by price"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <div className="chips">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className={'chip ' + (t === type ? 'active' : '')}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loadError && <p role="alert" className="badge-bad">{loadError}</p>}

      <p className="muted small-text">
        Showing {shown.length} of {vehicles.length} vehicles
      </p>

      <div className="grid">
        {shown.map((v) => (
          <article
            className={'card vehicle ' + (v.available ? '' : 'unavail')}
            key={v.id}
          >
            <div className="vehicle-image">
              <img
                src={vehicleImages[v.name] || fallbackImage}
                alt={`${v.name} vehicle`}
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.dataset.fallbackApplied) return;
                  e.currentTarget.dataset.fallbackApplied = 'true';
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            <div className="vehicle-details">
              <h4>{v.name}</h4>
              <p className="muted small-text">{v.description}</p>

              <div className="meta">
                <span className="tag">{v.type}</span>
                <span className="tag">👥 {v.seats} seats</span>
                <span className="tag">⛽ {v.fuel}</span>
                <span className="tag">⚙️ {v.transmission}</span>
              </div>

              <div className="price-row">
                <span>
                  <b>{money(v.pricePerDay)}</b>{' '}
                  <span className="muted small-text">/ day</span>
                </span>

                {days > 0 && v.available && (
                  <span className="muted small-text">
                    Total {money(v.pricePerDay * days)}
                  </span>
                )}
              </div>

              {v.maintenance ? (
                <div className="badge-bad">Under maintenance</div>
              ) : !v.available ? (
                <div className="badge-bad">Unavailable for these dates</div>
              ) : (
                !isAdmin && (
                  <button
                    type="button"
                    className="btn"
                    disabled={days <= 0}
                    onClick={() => onBook(v)}
                  >
                    {days > 0 ? 'Book now' : 'Choose dates to book'}
                  </button>
                )
              )}
            </div>
          </article>
        ))}

        {!loadError && shown.length === 0 && (
          <p className="muted">
            {vehicles.length === 0
              ? 'Loading vehicles...'
              : 'No vehicles match your search.'}
          </p>
        )}
      </div>
    </>
  );
}
