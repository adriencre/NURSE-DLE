import ColumnHeader from './ColumnHeader';
import './TableHeaders.css';

function TableHeaders() {
  const columns = [
    { 
      key: 'system', 
      label: 'Système',
      description: 'Le système corporel affecté par la pathologie (ex: Cardio, Digestif, Respiratoire)'
    },
    { 
      key: 'type', 
      label: 'Type',
      description: 'Le type de pathologie (ex: Ischémique, Viral/Bactérien, Inflammatoire)'
    },
    { 
      key: 'urgency', 
      label: 'Urgence',
      description: 'Le niveau d\'urgence de la pathologie (ex: Vitale, Relative, Variable)'
    },
    { 
      key: 'population', 
      label: 'Population',
      description: 'La population cible affectée (ex: Adulte/Senior, Tous)'
    },
    { 
      key: 'chronic', 
      label: 'Chronique',
      description: 'La nature chronique de la pathologie (ex: Aiguë, Chronique)'
    }
  ];

  return (
    <div className="table-headers">
      {columns.map((column) => (
        <ColumnHeader
          key={column.key}
          label={column.label}
          description={column.description}
        />
      ))}
    </div>
  );
}

export default TableHeaders;

