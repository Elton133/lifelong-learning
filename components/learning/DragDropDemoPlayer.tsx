'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { DragDropDemoConfig, DraggableElement, DropZone } from '@/types/database';

interface DragDropDemoPlayerProps {
  config: DragDropDemoConfig;
  onComplete: (score: number) => void;
  isFullscreen: boolean;
}

export default function DragDropDemoPlayer({
  config,
  onComplete,
  isFullscreen,
}: DragDropDemoPlayerProps) {
  const [draggedElement, setDraggedElement] = useState<DraggableElement | null>(null);
  const [droppedElements, setDroppedElements] = useState<{ [zoneId: string]: DraggableElement[] }>({});
  const [availableElements, setAvailableElements] = useState<DraggableElement[]>(config.elements);
  const [validationResults, setValidationResults] = useState<{ [zoneId: string]: boolean | null }>({});
  const [showResults, setShowResults] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleDragStart = (element: DraggableElement) => {
    setDraggedElement(element);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zoneId: string, zone: DropZone) => {
    if (!draggedElement) return;

    // Check if zone accepts this type
    if (zone.accepts && !zone.accepts.includes(draggedElement.type)) {
      return;
    }

    // Check max items
    const currentItems = droppedElements[zoneId] || [];
    if (zone.max_items && currentItems.length >= zone.max_items) {
      return;
    }

    // Add element to zone
    setDroppedElements((prev) => ({
      ...prev,
      [zoneId]: [...(prev[zoneId] || []), draggedElement],
    }));

    // Remove from available elements
    setAvailableElements((prev) =>
      prev.filter((el) => el.id !== draggedElement.id)
    );

    // Immediate validation if configured
    if (config.validation_type === 'immediate') {
      validateZone(zoneId, [...currentItems, draggedElement]);
    }

    setDraggedElement(null);
  };

  const removeFromZone = (zoneId: string, elementId: string) => {
    const element = droppedElements[zoneId]?.find((el) => el.id === elementId);
    if (!element) return;

    // Remove from zone
    setDroppedElements((prev) => ({
      ...prev,
      [zoneId]: (prev[zoneId] || []).filter((el) => el.id !== elementId),
    }));

    // Add back to available
    setAvailableElements((prev) => [...prev, element]);

    // Clear validation for this zone
    setValidationResults((prev) => ({
      ...prev,
      [zoneId]: null,
    }));
  };

  const validateZone = (zoneId: string, elements: DraggableElement[]) => {
    const correctElementIds = Object.entries(config.correct_mappings)
      .filter(([, zone]) => zone === zoneId)
      .map(([elementId]) => elementId);

    const isCorrect =
      elements.length === correctElementIds.length &&
      elements.every((el) => correctElementIds.includes(el.id));

    setValidationResults((prev) => ({
      ...prev,
      [zoneId]: isCorrect,
    }));

    return isCorrect;
  };

  const handleSubmit = () => {
    setAttempts((prev) => prev + 1);
    setShowResults(true);

    // Validate all zones
    const results: { [zoneId: string]: boolean } = {};
    config.drop_zones.forEach((zone) => {
      const elements = droppedElements[zone.id] || [];
      results[zone.id] = validateZone(zone.id, elements);
    });

    // Calculate score
    const correctZones = Object.values(results).filter((v) => v).length;
    const totalZones = config.drop_zones.length;
    let score = Math.round((correctZones / totalZones) * 100);

    // Penalty for multiple attempts
    if (attempts > 2) {
      score = Math.max(0, score - (attempts - 2) * 5);
    }

    // Complete if all correct
    if (correctZones === totalZones) {
      setTimeout(() => {
        onComplete(score);
      }, 1500);
    }
  };

  const handleReset = () => {
    setDroppedElements({});
    setAvailableElements(config.elements);
    setValidationResults({});
    setShowResults(false);
    setDraggedElement(null);
  };

  const renderElement = (element: DraggableElement) => (
    <div
      draggable
      onDragStart={() => handleDragStart(element)}
      onDragEnd={handleDragEnd}
      className={`p-3 rounded-lg border-2 cursor-move transition-all ${
        draggedElement?.id === element.id
          ? 'border-primary bg-primary/10 opacity-50'
          : 'border-border bg-background hover:border-primary/50'
      }`}
    >
      {element.type === 'text' && (
        <span className="text-sm font-medium">{element.content}</span>
      )}
      {element.type === 'image' && element.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.image_url}
          alt={element.content}
          className="w-full h-auto rounded"
        />
      )}
      {element.type === 'icon' && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{element.icon_name}</span>
          <span className="text-xs">{element.content}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${isFullscreen ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{config.title}</h2>
        <p className="text-muted-foreground">{config.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span>Attempts: {attempts}</span>
          {showResults && (
            <Badge variant={Object.values(validationResults).every((v) => v) ? 'primary' : 'outline'}>
              {Object.values(validationResults).filter((v) => v).length} / {config.drop_zones.length} Correct
            </Badge>
          )}
        </div>
      </div>

      <div className={`grid ${isFullscreen ? 'grid-cols-3 gap-8 h-[calc(100%-10rem)]' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Available Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableElements.length > 0 ? (
                availableElements.map((element) => (
                  <div key={element.id}>{renderElement(element)}</div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  All items have been placed
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Drop Zones */}
        <div className="lg:col-span-2 space-y-4">
          {config.drop_zones.map((zone) => {
            const elements = droppedElements[zone.id] || [];
            const validationResult = validationResults[zone.id];
            const hasValidation = validationResult !== undefined && validationResult !== null;

            return (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{zone.label}</CardTitle>
                    {hasValidation && showResults && (
                      validationResult ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )
                    )}
                  </div>
                  {zone.max_items && (
                    <p className="text-xs text-muted-foreground">
                      Max items: {zone.max_items}
                    </p>
                  )}
                </CardHeader>
                <CardContent
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(zone.id, zone)}
                  className={`min-h-[120px] border-2 border-dashed rounded-lg transition-all ${
                    draggedElement
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  } ${
                    hasValidation && showResults
                      ? validationResult
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                      : ''
                  }`}
                >
                  {elements.length > 0 ? (
                    <div className="space-y-2">
                      {elements.map((element) => (
                        <div key={element.id} className="relative group">
                          {renderElement(element)}
                          {!showResults && (
                            <button
                              onClick={() => removeFromZone(zone.id, element.id)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Drop items here
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={availableElements.length > 0} className="flex-1">
          {showResults ? 'Try Again' : 'Submit'}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
