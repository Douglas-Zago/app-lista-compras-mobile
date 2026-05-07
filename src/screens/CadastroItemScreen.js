import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemSchema } from '../schemas/itemSchema';
import ItemCard from '../components/ItemCard';

// CONFIGURAÇÃO DA API REST DO BACK4APP
const APP_ID = '7JIIB75Jq3JVB1nyxvfTIyIubhNwtCdv5FJ63lHg';
const REST_KEY = 'EHhJpGnEA2sKNTfUwFlh4C6NdDVCPyBEYiYOr9Rp'; // Sua REST API Key configurada!
const API_URL = 'https://parseapi.back4app.com/classes/ItemCompra';

const HEADERS = {
  'X-Parse-Application-Id': APP_ID,
  'X-Parse-REST-API-Key': REST_KEY,
  'Content-Type': 'application/json',
};

const CadastroItemScreen = () => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: { nome: '', quantidade: 1, categoria: '' },
  });

  const quantidadeAtual = watch('quantidade');

  const alterarQuantidade = (valor) => {
    const novaQuantidade = quantidadeAtual + valor;
    if (novaQuantidade >= 1) setValue('quantidade', novaQuantidade);
  };

  // 1. LER DADOS DO BANCO (GET)
  const carregarItens = async () => {
    setLoading(true);
    try {
      const resposta = await fetch(`${API_URL}?order=-createdAt`, { 
        method: 'GET', 
        headers: HEADERS 
      });
      const dados = await resposta.json();
      
      if (dados.results) {
        const itensFormatados = dados.results.map(item => ({
          id: item.objectId, // O Back4App chama o ID de objectId
          nome: item.nome,
          quantidade: Number(item.quantidade),
          categoria: item.categoria,
          comprado: item.comprado,
        }));
        setItens(itensFormatados);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os itens.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os itens assim que a tela abre
  useEffect(() => {
    carregarItens();
  }, []);

  // 2. SALVAR DADOS NO BANCO (POST)
  const onSubmit = async (data) => {
    const novoItemBody = {
      nome: data.nome,
      quantidade: String(data.quantidade), // Convertendo pra string conforme seu schema
      categoria: data.categoria || '',
      comprado: false,
    };

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(novoItemBody)
      });
      const dadosSalvos = await resposta.json();

      if (dadosSalvos.objectId) {
        // Atualiza a lista na tela instantaneamente com o ID gerado pelo banco
        setItens([{ id: dadosSalvos.objectId, ...novoItemBody, quantidade: Number(novoItemBody.quantidade) }, ...itens]);
        reset({ nome: '', quantidade: 1, categoria: '' });
        Alert.alert('Sucesso', 'Item salvo no banco de dados!');
      } else {
        throw new Error('Falha de permissão no banco');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o item. Verifique as permissões (CLP) no Back4App.');
    }
  };

  // 3. ATUALIZAR STATUS NO BANCO (PUT)
  const toggleComprado = async (id) => {
    const itemAtual = itens.find(i => i.id === id);
    if (!itemAtual) return;

    const novoStatus = !itemAtual.comprado;
    
    // Atualiza a interface primeiro para não dar delay pro usuário
    setItens(prev => prev.map(item => item.id === id ? { ...item, comprado: novoStatus } : item));

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({ comprado: novoStatus })
      });
      
      if (!resposta.ok) throw new Error('Erro ao atualizar');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar no banco.');
      carregarItens(); // Se falhar na API, recarrega a lista original
    }
  };

  // 4. EXCLUIR ITEM DO BANCO (DELETE)
  const excluirItem = async (id) => {
    // Remove da tela na hora para dar feedback rápido
    setItens(prev => prev.filter(item => item.id !== id)); 

    try {
      const resposta = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE', 
        headers: HEADERS 
      });
      
      if (!resposta.ok) throw new Error('Erro ao deletar');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir item do banco.');
      carregarItens(); // Se falhar na API, traz o item de volta
    }
  };

  // 5. LIMPAR TODOS OS COMPRADOS
  const limparComprados = async () => {
    const itensComprados = itens.filter(i => i.comprado);
    if (itensComprados.length === 0) return;

    Alert.alert(
      'Limpar Lista',
      'Deseja remover todos os itens comprados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            // Remove da tela
            setItens(prev => prev.filter(item => !item.comprado)); 
            
            // Apaga um por um no banco
            try {
              for (const item of itensComprados) {
                await fetch(`${API_URL}/${item.id}`, { method: 'DELETE', headers: HEADERS });
              }
            } catch (error) {
              Alert.alert('Erro', 'Alguns itens podem não ter sido apagados do servidor.');
              carregarItens();
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nova Compra</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Item *</Text>
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.nome && styles.inputError]} placeholder="Ex: Maçã" onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
          />
          {errors.nome && <Text style={styles.errorText}>{errors.nome.message}</Text>}
        </View>

        <View style={styles.row}>
          <View style={styles.colQuantidade}>
            <Text style={styles.label}>Quantidade *</Text>
            <View style={styles.qtdContainer}>
              <TouchableOpacity style={styles.qtdBtn} onPress={() => alterarQuantidade(-1)}>
                <Text style={styles.qtdBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtdText}>{quantidadeAtual}</Text>
              <TouchableOpacity style={styles.qtdBtn} onPress={() => alterarQuantidade(1)}>
                <Text style={styles.qtdBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.colCategoria}>
            <Text style={styles.label}>Categoria (Opcional)</Text>
            <Controller
              control={control}
              name="categoria"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} placeholder="Ex: Frutas" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnAddText}>Adicionar à Lista</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.titleList}>Minha Lista</Text>
          {itens.some(i => i.comprado) && (
            <TouchableOpacity onPress={limparComprados}>
              <Text style={styles.btnLimparText}>Limpar Comprados</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={itens}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <ItemCard item={item} onToggleComprado={toggleComprado} onExcluir={excluirItem} />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Sua lista está vazia. Adicione itens acima!</Text>}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  formContainer: { backgroundColor: '#fff', padding: 20, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, zIndex: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  colQuantidade: { flex: 1 },
  colCategoria: { flex: 2 },
  label: { fontSize: 14, color: '#34495e', fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16, color: '#2c3e50' },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fdf3f2' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 4, fontWeight: '500' },
  qtdContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden' },
  qtdBtn: { padding: 12, backgroundColor: '#ecf0f1', alignItems: 'center', justifyContent: 'center', minWidth: 40 },
  qtdBtnText: { fontSize: 18, fontWeight: 'bold', color: '#34495e' },
  qtdText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  btnAdd: { backgroundColor: '#3498db', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnAddText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listContainer: { flex: 1, padding: 20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleList: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  btnLimparText: { color: '#e74c3c', fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }
});

export default CadastroItemScreen;