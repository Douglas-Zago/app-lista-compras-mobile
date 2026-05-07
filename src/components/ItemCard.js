import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ItemCard = ({ item, onToggleComprado, onExcluir }) => {
  return (
    <View style={[styles.card, item.comprado && styles.cardComprado]}>
      <View style={styles.infoContainer}>
        <Text style={[styles.nome, item.comprado && styles.textoRiscado]}>
          {item.nome}
        </Text>
        
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Qtd: {item.quantidade}</Text>
          </View>
          {item.categoria ? (
            <View style={[styles.badge, styles.badgeCategoria]}>
              <Text style={styles.badgeText}>{item.categoria}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.btnComprar, item.comprado && styles.btnComprado]}
          onPress={() => onToggleComprado(item.id)}
        >
          <Text style={styles.btnTextComprar}>
            {item.comprado ? 'Comprado ✓' : 'Comprar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnExcluir} onPress={() => onExcluir(item.id)}>
          <Text style={styles.btnTextExcluir}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  cardComprado: {
    backgroundColor: '#f8f9fa',
    borderLeftColor: '#2ecc71',
    opacity: 0.8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  textoRiscado: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCategoria: {
    backgroundColor: '#e8f4fd',
  },
  badgeText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  actionsContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 10,
    gap: 8,
  },
  btnComprar: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  btnComprado: {
    backgroundColor: '#2ecc71',
  },
  btnTextComprar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnExcluir: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  btnTextExcluir: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ItemCard;