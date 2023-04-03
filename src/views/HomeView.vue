<template>
  <main class="mt-5">
    <expandableTable
      :data="data"
      :years="years"
      :currencies="currencies"
      :types="types"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableCompany, Company, Quote, TableQuote } from '@/types/general'
import { onlyUnique } from '@/components/helpers/filters'
import expandableTable from '@/components/organisms/expandableTable.vue'
import tableData from '@/assets/data.json'

const data = ref<Array<TableCompany>>([])
const years = ref<Array<number>>([])
const currencies = ref<Array<string>>([])
const types = ref<Array<string>>([])

onMounted(() => formatData(tableData.Items as Array<Company>))

const formatData = (inputData: Array<Company>) => {
  const tableItens: Array<TableCompany> = []

  inputData.forEach((company: Company) => {
    const companyItens: TableCompany = {
      id: company.Id,
      company: company.Company,
      preferred: company.Preferred,
      dateSent: company.DateSent,
      quotes: null,
    }
    if (company.Quote) {
      companyItens.quotes = formatQuotes(company.Quote)
    }
    tableItens.push(companyItens)
  })

  years.value = years.value.filter(onlyUnique).sort((a, b) => a - b)
  currencies.value = currencies.value.filter(onlyUnique).sort()
  types.value = types.value.filter(onlyUnique).sort()
  data.value = tableItens
}

const formatQuotes = (inputQuotes: Array<Quote>) => {
  const companyQuotes: TableQuote = {
    spread: [],
    yield: [],
    '3MLSpread': [],
  }

  inputQuotes.forEach((quote) => {
    const customKey = `${quote.Years}-${quote.Currency}-${quote.CouponType}`
    companyQuotes.spread.push({ key: customKey, value: quote.Spread })
    companyQuotes.yield.push({ key: customKey, value: quote.Yield })
    companyQuotes['3MLSpread'].push({
      key: customKey,
      value: quote['3MLSpread'],
    })

    years.value.push(quote.Years)
    currencies.value.push(quote.Currency)
    types.value.push(quote.CouponType)
  })

  return companyQuotes
}
</script>
