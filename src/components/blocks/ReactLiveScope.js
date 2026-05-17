import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// react-live 코드 블록에서 사용 가능한 전역 스코프
// Docusaurus의 ReactLiveScope와 동일한 역할
const ReactLiveScope = {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
}

export default ReactLiveScope
